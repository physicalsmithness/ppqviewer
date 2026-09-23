"use strict";
// Explicitly installed in a disposable, synchronous evidence-builder worker.
// Canonical evidence paths still appear in records; only their filesystem reads
// and writes are redirected. This is a guard for ordinary Node fs calls, not an
// OS security sandbox. Do not install it in the release process or a shared host.
const fs = require("fs"), path = require("path"), {fileURLToPath} = require("url");
let installed = false;

function install({replacements, writableRoot}) {
  if (installed) throw Error("Evidence overlay is already installed");
  if (!(replacements instanceof Map) || !path.isAbsolute(writableRoot || ""))
    throw Error("Evidence overlay requires a Map and an absolute writableRoot");
  const original = Object.fromEntries(Object.entries(Object.getOwnPropertyDescriptors(fs)).filter(([, d]) => typeof d.value === "function").map(([k, d]) => [k, d.value]));
  const promises = fs.promises;
  const originalPromises = Object.fromEntries(Object.keys(promises).filter(k => typeof promises[k] === "function").map(k => [k, promises[k]]));
  const root = path.resolve(writableRoot);
  if (!original.statSync(root).isDirectory()) throw Error("Evidence overlay writableRoot must exist as a directory");
  const realRoot = original.realpathSync(root);
  const key = p => process.platform === "win32" ? p.toLowerCase() : p;
  const inside = (base, file) => {
    const relative = path.relative(key(base), key(file));
    return relative === "" || (!relative.startsWith(".." + path.sep) && relative !== ".." && !path.isAbsolute(relative));
  };
  const filename = value => {
    if (value instanceof URL) value = fileURLToPath(value);
    if (Buffer.isBuffer(value)) value = value.toString();
    if (typeof value !== "string") throw Error("Evidence overlay requires a filesystem path, not a file descriptor");
    return path.resolve(value);
  };
  const mapping = new Map();
  function assertWritable(file) {
    if (!inside(root, file)) throw Error("Evidence overlay forbids mutation outside writableRoot: " + file);
    // Reject directory junctions/symlinks escaping the candidate tree, including
    // an existing final target. Find the nearest existing ancestor for new files.
    let ancestor = file;
    while (true) {
      try { original.lstatSync(ancestor); break; }
      catch (error) {
        if (error.code !== "ENOENT") throw error;
        const parent = path.dirname(ancestor);
        if (parent === ancestor) throw error;
        ancestor = parent;
      }
    }
    if (!inside(realRoot, original.realpathSync(ancestor)))
      throw Error("Evidence overlay destination escapes through a symlink: " + file);
    return file;
  }
  for (const [from, to] of replacements) {
    if (typeof from !== "string" || typeof to !== "string" || !path.isAbsolute(from) || !path.isAbsolute(to))
      throw Error("Evidence overlay replacements must have absolute paths");
    const canonical = key(path.resolve(from)), candidate = assertWritable(path.resolve(to));
    if (mapping.has(canonical)) throw Error("Evidence overlay has duplicate canonical paths: " + from);
    mapping.set(canonical, candidate);
  }
  const mapped = value => typeof value === "number" ? value : mapping.get(key(filename(value))) || value;
  const destination = value => assertWritable(filename(mapped(value)));
  const changes = [], promiseChanges = [];
  const patch = (name, replacement) => { if (typeof original[name] === "function") { fs[name] = replacement; changes.push(name); } };
  const denied = name => { throw Error("Evidence overlay forbids " + name + "; use supported synchronous path operations"); };
  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    for (const name of changes) fs[name] = original[name];
    for (const name of promiseChanges) promises[name] = originalPromises[name];
    installed = false;
  };
  installed = true;
  try {
    for (const name of ["readFileSync", "existsSync", "statSync", "lstatSync", "readdirSync", "realpathSync", "readlinkSync", "accessSync"])
      patch(name, (file, ...args) => original[name](mapped(file), ...args));
    if (original.realpathSync.native)
      fs.realpathSync.native = (file, ...args) => original.realpathSync.native(mapped(file), ...args);
    for (const name of ["writeFileSync", "appendFileSync", "truncateSync", "chmodSync", "chownSync", "lchmodSync", "lchownSync", "utimesSync", "lutimesSync"])
      patch(name, (file, ...args) => original[name](destination(file), ...args));
    for (const name of ["unlinkSync", "rmSync", "rmdirSync"])
      patch(name, (file, ...args) => {
        const target = destination(file);
        if (key(target) === key(root)) throw Error("Evidence overlay forbids removing its writableRoot");
        return original[name](target, ...args);
      });
    patch("copyFileSync", (from, to, ...args) => original.copyFileSync(mapped(from), destination(to), ...args));
    patch("renameSync", (from, to, ...args) => original.renameSync(destination(from), destination(to), ...args));
    patch("mkdirSync", (dir, ...args) => {
      const target = filename(mapped(dir));
      if (!inside(root, target)) {
        // Builders often ensure the already-existing canonical output parent.
        // This does not create or modify that active directory.
        if (original.existsSync(target) && original.statSync(target).isDirectory()) return undefined;
        throw Error("Evidence overlay forbids creating an active directory: " + target);
      }
      return original.mkdirSync(assertWritable(target), ...args);
    });
    patch("openSync", (file, flags, ...args) => {
      if (!["r", "rs", "sr", fs.constants.O_RDONLY].includes(flags)) return denied("openSync with write flags");
      return original.openSync(mapped(file), flags, ...args);
    });
    // Keep fd writes, links, recursive copies and streams out of this small API.
    for (const name of ["writeSync", "writevSync", "ftruncateSync", "fchmodSync", "fchownSync", "futimesSync", "linkSync", "symlinkSync", "cpSync", "mkdtempSync", "mkdtempDisposableSync", "createWriteStream"])
      patch(name, () => denied(name));
    const asyncMutations = ["writeFile", "appendFile", "write", "writev", "truncate", "ftruncate", "chmod", "fchmod", "lchmod", "chown", "fchown", "lchown", "utimes", "futimes", "lutimes", "unlink", "rm", "rmdir", "mkdir", "mkdtemp", "mkdtempDisposable", "copyFile", "cp", "rename", "link", "symlink", "open"];
    for (const name of asyncMutations) {
      patch(name, () => denied(name));
      if (typeof originalPromises[name] === "function") {
        promises[name] = async () => denied("fs.promises." + name);
        promiseChanges.push(name);
      }
    }
    return restore;
  } catch (error) { restore(); throw error; }
}

module.exports = {install};
