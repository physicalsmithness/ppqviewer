/* Optional TeacherViewer extension. The host owns authentication and projects;
   the server returns the authorised queue. This module never publishes on load. */
(function (global) {
  "use strict";
  var instance = null;

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function safeSourceUrl(value) {
    try {
      var url = new URL(String(value || ""));
      return /^(https?:)$/.test(url.protocol) && !url.username && !url.password ? url.href : "";
    } catch (_) { return ""; }
  }
  function mount() {
    if (instance) return instance;
    var tabs = document.querySelector(".tabs");
    if (!tabs || document.getElementById("tab-help")) return null;
    var destroyed = false, active = false, loading = false, publishing = false, loadVersion = 0;
    var requests = [], selectedId = "", drafts = new Map(), hiddenHosts = [], previousTab = null;
    var tab = element("button", "tab", "Questions from pupils");
    tab.type = "button"; tab.dataset.tab = "help";
    var panel = element("section", "tv-help-panel"); panel.id = "tab-help"; panel.hidden = true;
    var title = element("h2", "", "Questions from pupils");
    var notice = element("p", "tv-help-note", "Replies are public. Rewrite each question for everyone and remove names and personal details from both the question and your reply.");
    var controls = element("div", "controls tv-help-controls");
    var projectLabel = element("label", "", "Subject / project ");
    var project = element("select", "tv-help-project"); project.setAttribute("aria-label", "Subject or project");
    projectLabel.appendChild(project);
    var statusLabel = element("label", "", "Show ");
    var statusFilter = element("select", "tv-help-status-filter"); statusFilter.setAttribute("aria-label", "Request status");
    [["", "All questions"], ["pending", "Awaiting answer"], ["answered", "Answered"]].forEach(function (pair) {
      var option = element("option", "", pair[1]); option.value = pair[0]; statusFilter.appendChild(option);
    });
    statusLabel.appendChild(statusFilter);
    var refresh = element("button", "tv-help-refresh", "Refresh questions"); refresh.type = "button";
    controls.appendChild(projectLabel); controls.appendChild(statusLabel); controls.appendChild(refresh);
    var feedback = element("p", "tv-help-feedback"); feedback.setAttribute("role", "status"); feedback.setAttribute("aria-live", "polite");
    var layout = element("div", "tv-help-layout"), list = element("div", "tv-help-list"), editor = element("div", "tv-help-editor");
    list.setAttribute("aria-label", "Pupil questions");
    layout.appendChild(list); layout.appendChild(editor);
    [title, notice, controls, feedback, layout].forEach(function (node) { panel.appendChild(node); });
    var style = element("style"); style.id = "tv-help-panel-style";
    style.textContent = ".tv-help-host-hidden{display:none!important}.tv-help-panel[hidden]{display:none!important}" +
      ".tv-help-panel h2{font-size:1.15em;margin:.8em 0 .3em}.tv-help-note,.tv-help-feedback{color:var(--muted,#666);font-size:.9em}" +
      ".tv-help-feedback[data-error=true],.tv-help-publish-status[data-error=true]{color:#b42318}" +
      ".tv-help-layout{display:grid;grid-template-columns:minmax(14em,1fr) minmax(20em,2fr);gap:1em;align-items:start}" +
      ".tv-help-list{max-height:75vh;overflow:auto}.tv-help-request{display:block;width:100%;text-align:left;margin:0 0 .45em;padding:.65em;overflow-wrap:anywhere}" +
      ".tv-help-request[aria-pressed=true]{border-color:#1d6fe0;background:#edf4ff}.tv-help-request small{display:block;color:var(--muted,#666);margin-top:.25em}" +
      ".tv-help-editor{border:1px solid var(--line,#e3e3e3);border-radius:8px;padding:1em;min-width:0}.tv-help-editor h3{margin:0 0 .35em;font-size:1em}" +
      ".tv-help-private,.tv-help-public-question,.tv-help-public-answer{white-space:pre-wrap;overflow-wrap:anywhere}" +
      ".tv-help-editor label{display:block;font-weight:600;margin-top:1em}.tv-help-editor textarea{display:block;width:100%;font:inherit;border:1px solid #b9bdc5;border-radius:5px;padding:.55em;margin-top:.35em;resize:vertical}" +
      ".tv-help-publication{background:#f0f7f0;border:1px solid #c9dfca;border-radius:6px;padding:.7em;margin-top:1em}.tv-help-publication h4{margin:0 0 .4em}" +
      ".tv-help-publish{margin-top:1em}.tv-help-publish-status{min-height:1.3em;font-size:.9em}.tv-help-source{display:block;margin:.4em 0}" +
      ".tv-help-panel button:disabled{opacity:.65;cursor:wait}.tv-help-panel .controls{gap:.7em;align-items:center}" +
      "@media(max-width:720px){.tv-help-layout{grid-template-columns:1fr}.tv-help-list{max-height:15em}.tabs{flex-wrap:wrap}}";
    document.head.appendChild(style); tabs.appendChild(tab);
    var firstHostPanel = document.querySelector('section[id^="tab-"]');
    if (firstHostPanel) firstHostPanel.parentNode.insertBefore(panel, firstHostPanel);
    else tabs.parentNode.insertAdjacentElement("afterend", panel);

    function requestStatus(request) { return request.reply ? "answered" : request.status === "answered" ? "answered" : "pending"; }
    function draftFor(request) {
      if (!drafts.has(request.request_id)) drafts.set(request.request_id, {
        question: request.reply ? String(request.reply.question || "") : "",
        answer: request.reply ? String(request.reply.answer || "") : "",
        dirty: false, busy: false, reviewed: false, message: "", error: false
      });
      return drafts.get(request.request_id);
    }
    function rpc(method, payload, success, failure) {
      try {
        var api = global.google && global.google.script && global.google.script.run;
        if (!api) throw new Error("Open the signed-in TeacherViewer to load or publish answers.");
        var runner = api.withSuccessHandler(function (response) { if (!destroyed) success(response); })
          .withFailureHandler(function (error) { if (!destroyed) failure(error); });
        if (payload === undefined) runner[method](); else runner[method](payload);
      } catch (error) { failure(error); }
    }
    function showFeedback(message, error) { feedback.textContent = message; feedback.dataset.error = String(!!error); }
    function errorText(error) { return error && error.message ? String(error.message) : "Please try again."; }
    function updateProjects() {
      var previous = project.value;
      project.replaceChildren();
      var all = element("option", "", "All subjects / projects"); all.value = ""; project.appendChild(all);
      Array.from(new Set(requests.map(function (r) { return r.project; }))).sort().forEach(function (name) {
        var option = element("option", "", name); option.value = name; project.appendChild(option);
      });
      if (Array.from(project.options).some(function (option) { return option.value === previous; })) project.value = previous;
    }
    function renderList() {
      list.replaceChildren();
      var visible = requests.filter(function (r) { return (!project.value || r.project === project.value) && (!statusFilter.value || requestStatus(r) === statusFilter.value); });
      if (!visible.some(function (r) { return r.request_id === selectedId; })) selectedId = visible.length ? visible[0].request_id : "";
      if (!visible.length) list.appendChild(element("p", "empty", loading ? "Loading questions…" : "No questions in this selection."));
      visible.forEach(function (request) {
        var button = element("button", "tv-help-request"); button.type = "button"; button.dataset.requestId = request.request_id;
        button.setAttribute("aria-pressed", String(request.request_id === selectedId));
        button.appendChild(element("span", "", request.source_label || request.item_id || "Question"));
        button.appendChild(element("small", "", request.project + " · " + (requestStatus(request) === "answered" ? "Answered" : "Awaiting answer")));
        button.addEventListener("click", function () { selectedId = request.request_id; renderList(); });
        list.appendChild(button);
      });
      renderEditor();
    }
    function renderEditor() {
      editor.replaceChildren();
      var request = requests.find(function (r) { return r.request_id === selectedId; });
      if (!request) { editor.appendChild(element("p", "tv-help-note", "Choose a pupil question to review it.")); return; }
      var draft = draftFor(request);
      editor.appendChild(element("h3", "", request.source_label || request.item_id || "Question"));
      editor.appendChild(element("p", "tv-help-note", request.project + (request.created_at ? " · " + request.created_at : "")));
      var url = safeSourceUrl(request.source_url);
      if (url) { var link = element("a", "tv-help-source", "Open the original question"); link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer"; editor.appendChild(link); }
      editor.appendChild(element("strong", "", "Pupil’s question (private)"));
      editor.appendChild(element("p", "tv-help-private", request.question));
      if (request.reply) {
        var published = element("section", "tv-help-publication");
        published.appendChild(element("h4", "", "Published for everyone"));
        published.appendChild(element("p", "tv-help-public-question", request.reply.question));
        published.appendChild(element("p", "tv-help-public-answer", request.reply.answer));
        if (request.reply.published_at) published.appendChild(element("small", "", request.reply.published_at));
        editor.appendChild(published);
      }
      var questionLabel = element("label", "", "Question to publish");
      var question = element("textarea", "tv-help-question"); question.rows = 4; question.value = draft.question;
      question.setAttribute("aria-label", "Question to publish"); question.placeholder = "Rewrite the question without names or personal details.";
      questionLabel.appendChild(question); editor.appendChild(questionLabel);
      var answerLabel = element("label", "", "Your reply");
      var answer = element("textarea", "tv-help-answer"); answer.rows = 7; answer.value = draft.answer;
      answer.setAttribute("aria-label", "Your reply"); answerLabel.appendChild(answer); editor.appendChild(answerLabel);
      var reviewedLabel = element("label", "tv-help-reviewed-label");
      var reviewed = element("input", "tv-help-reviewed"); reviewed.type = "checkbox"; reviewed.checked = draft.reviewed;
      reviewedLabel.appendChild(reviewed); reviewedLabel.appendChild(document.createTextNode(" I have checked that the public question and reply contain no pupil names or personal details."));
      editor.appendChild(reviewedLabel);
      var publish = element("button", "primary tv-help-publish", "Publish answer for everyone"); publish.type = "button";
      var result = element("p", "tv-help-publish-status", draft.message); result.setAttribute("role", "status"); result.setAttribute("aria-live", "polite"); result.dataset.error = String(draft.error);
      [question, answer, reviewed].forEach(function (node) { node.disabled = draft.busy; }); publish.disabled = publishing;
      function edited() { draft.question = question.value; draft.answer = answer.value; draft.dirty = true; draft.reviewed = false; reviewed.checked = false; draft.message = ""; result.textContent = ""; }
      question.addEventListener("input", edited); answer.addEventListener("input", edited);
      reviewed.addEventListener("change", function () { draft.reviewed = reviewed.checked; });
      publish.addEventListener("click", function () {
        if (publishing) return;
        draft.question = question.value; draft.answer = answer.value;
        var publicQuestion = draft.question.trim(), publicAnswer = draft.answer.trim();
        if (!publicQuestion || !publicAnswer || !draft.reviewed) {
          draft.message = !publicQuestion || !publicAnswer ? "Write a public question and your reply before publishing." : "Check the public question and reply for names and personal details, then tick the confirmation.";
          draft.error = true; result.textContent = draft.message; result.dataset.error = "true"; return;
        }
        // Discard any older inbox read so it cannot overwrite the publication.
        loadVersion++; loading = false; publishing = true; refresh.disabled = true;
        showFeedback("Publishing answer…", false);
        draft.busy = true; draft.message = "Publishing…"; draft.error = false; renderEditor();
        rpc("tvHelpPublish", {request_id:request.request_id, question:publicQuestion, answer:publicAnswer, reviewed_public_question:true}, function (response) {
          var reply = response && response.reply;
          if (!response || response.ok !== true || !reply || reply.request_id !== request.request_id || reply.project !== request.project || reply.item_id !== request.item_id || typeof reply.question !== "string" || !reply.question.trim() || typeof reply.answer !== "string" || !reply.answer.trim()) {
            failed(new Error(response && response.error ? String(response.error) : "The server did not confirm publication. Your draft is kept.")); return;
          }
          request.reply = reply; request.status = "answered";
          publishing = false; refresh.disabled = false;
          draft.busy = false; draft.dirty = false; draft.reviewed = false; draft.question = reply.question; draft.answer = reply.answer;
          draft.message = "Published for everyone."; draft.error = false; renderList(); showFeedback(draft.message, false);
        }, failed);
        function failed(error) { publishing = false; refresh.disabled = false; draft.busy = false; draft.error = true; draft.message = "Could not publish. " + errorText(error); renderEditor(); showFeedback(draft.message, true); }
      });
      editor.appendChild(publish); editor.appendChild(result);
    }
    function load() {
      if (loading || publishing) return;
      var version = ++loadVersion; loading = true; refresh.disabled = true; showFeedback("Loading questions…", false);
      rpc("tvHelpInbox", undefined, function (response) {
        if (version !== loadVersion) return;
        loading = false; refresh.disabled = false;
        if (!response || response.ok !== true || !Array.isArray(response.requests)) { showFeedback("Could not load questions. " + String(response && response.error || "The server did not confirm the request."), true); return; }
        requests = response.requests.filter(function (r) { return r && typeof r.request_id === "string" && r.request_id && typeof r.project === "string" && typeof r.question === "string"; });
        requests.forEach(function (request) {
          var draft = drafts.get(request.request_id);
          if (draft && !draft.dirty && !draft.busy) {
            draft.question = request.reply ? String(request.reply.question || "") : "";
            draft.answer = request.reply ? String(request.reply.answer || "") : "";
            draft.reviewed = false;
          }
        });
        updateProjects(); renderList(); showFeedback(requests.length + " question" + (requests.length === 1 ? "" : "s") + " available.", false);
      }, function (error) { if (version !== loadVersion) return; loading = false; refresh.disabled = false; showFeedback("Could not load questions. " + errorText(error), true); });
    }
    function activate() {
      if (!active) previousTab = tabs.querySelector(".tab.active");
      active = true; panel.hidden = false;
      tabs.querySelectorAll(".tab").forEach(function (button) { button.classList.toggle("active", button === tab); });
      hiddenHosts = Array.from(document.querySelectorAll('section[id^="tab-"], body > .controls, body > .legend, #detail, #f-project, #btn-refresh-top, #refreshed, #status'))
        .filter(function (node) { return node !== panel && !panel.contains(node); }).map(function (node) { return node.id === "f-project" ? node.closest("label") || node : node; });
      hiddenHosts.forEach(function (node) { node.classList.add("tv-help-host-hidden"); });
      load();
    }
    function deactivate() { active = false; panel.hidden = true; hiddenHosts.forEach(function (node) { node.classList.remove("tv-help-host-hidden"); }); hiddenHosts = []; }
    function onTabClick(event) { var button = event.target.closest(".tab"); if (button && button !== tab && active) deactivate(); }
    tab.addEventListener("click", function (event) { event.preventDefault(); event.stopImmediatePropagation(); activate(); }, true);
    tabs.addEventListener("click", onTabClick);
    refresh.addEventListener("click", load); project.addEventListener("change", renderList); statusFilter.addEventListener("change", renderList);
    updateProjects(); renderList();
    instance = {destroy:function () {
      if (destroyed) return;
      destroyed = true;
      var restoreTab = active && previousTab;
      deactivate();
      if (restoreTab && restoreTab.isConnected) restoreTab.classList.add("active");
      tabs.removeEventListener("click", onTabClick); tab.remove(); panel.remove(); style.remove(); instance = null;
    }};
    return instance;
  }
  global.TeacherClarificationsPanel = {mount:mount};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, {once:true}); else mount();
})(window);
