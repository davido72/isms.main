const fs = require("fs");
const vm = require("vm");

class DOMElement {
    constructor(tagName = "div", id = "") {
        this.tagName = tagName.toUpperCase();
        this.id = id;
        this.children = [];
        const classes = new Set();
        this.classList = {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            toggle: (c, force) => {
                if (force === true) classes.add(c);
                else if (force === false) classes.delete(c);
                else if (classes.has(c)) classes.delete(c);
                else classes.add(c);
            },
            contains: (c) => classes.has(c)
        };
        this.attributes = {};
        this._innerHTML = "";
        this._value = "";
    }
    setAttribute(name, val) { this.attributes[name] = val; }
    getAttribute(name) { return this.attributes[name] || null; }
    removeAttribute(name) { delete this.attributes[name]; }
    appendChild(el) { this.children.push(el); }
    remove() { }
    get innerHTML() { return this._innerHTML; }
    set innerHTML(val) { this._innerHTML = val; }
    get innerText() { return this._innerHTML.replace(/<[^>]*>/g, ""); }
    set innerText(val) { this._innerHTML = val; }
    get value() { return this._value; }
    set value(val) { this._value = val; }
    reset() { }
    dispatchEvent() { }
    addEventListener() { }
    removeEventListener() { }
}

const elementsById = new Map();
function getOrCreateElement(id) {
    if (!elementsById.has(id)) {
        elementsById.set(id, new DOMElement("div", id));
    }
    return elementsById.get(id);
}

const localStorageMap = new Map();
const localStorage = {
    getItem: (k) => localStorageMap.get(k) || null,
    setItem: (k, v) => localStorageMap.set(k, String(v)),
    removeItem: (k) => localStorageMap.delete(k),
    clear: () => localStorageMap.clear()
};

const domListeners = {};
global.window = {
    addEventListener: (type, fn) => {
        if (!domListeners[type]) domListeners[type] = [];
        domListeners[type].push(fn);
    },
    location: { hash: "" },
    history: { back: () => { }, forward: () => { } }
};
global.document = {
    documentElement: new DOMElement("html"),
    getElementById: (id) => getOrCreateElement(id),
    querySelectorAll: (sel) => [],
    querySelector: (sel) => null,
    createElement: (tag) => new DOMElement(tag),
    addEventListener: (type, fn) => {
        if (!domListeners[type]) domListeners[type] = [];
        domListeners[type].push(fn);
    }
};
global.localStorage = localStorage;
global.sessionStorage = localStorage;
global.navigator = { userAgent: "node" };

console.log("Loading scripts in index.html order...");
const scripts = [
    "js/config.js",
    "js/store.js",
    "js/validators.js",
    "js/supabaseClient.js",
    "js/pdfHelper.js",
    "js/aiAssistant.js",
    "js/views/authView.js",
    "js/views/studentView.js",
    "js/views/teacherView.js",
    "js/views/parentView.js",
    "js/views/adminView.js",
    "js/views/libraryView.js",
    "js/app.js"
];

for (const script of scripts) {
    try {
        console.log(`Executing ${script}...`);
        const code = fs.readFileSync(script, "utf8");
        vm.runInThisContext(code);
    } catch (err) {
        console.error(`ERROR in ${script}:`, err);
        process.exit(1);
    }
}

console.log("\nTriggering DOMContentLoaded...");
try {
    if (domListeners["DOMContentLoaded"]) {
        domListeners["DOMContentLoaded"].forEach(fn => fn());
    }
} catch (err) {
    console.error("ERROR during DOMContentLoaded / app.init():", err);
    process.exit(1);
}

console.log("\nTesting user logins and views...");


console.log("Testing Student role...");
try {
    authView.selectDemoRole("student");
    const currentUser = store.getCurrentUser();
    console.log("Current user after student demo:", currentUser ? currentUser.email : "none");
    app.navigateTo("dashboard");
    console.log("Student dashboard rendered length:", getOrCreateElement("view-content").innerHTML.length);
    app.navigateTo("course-registration");
    console.log("Student course-registration rendered length:", getOrCreateElement("view-content").innerHTML.length);
    app.navigateTo("attendance");
    console.log("Student attendance rendered length:", getOrCreateElement("view-content").innerHTML.length);
    app.navigateTo("results");
    console.log("Student results rendered length:", getOrCreateElement("view-content").innerHTML.length);
    app.navigateTo("fees");
    console.log("Student fees rendered length:", getOrCreateElement("view-content").innerHTML.length);
} catch (err) {
    console.error("ERROR in Student flow:", err);
}


console.log("\nTesting Teacher role...");
try {
    authView.selectDemoRole("teacher");
    const tcUser = store.getCurrentUser();
    console.log("Current user after teacher demo:", tcUser ? tcUser.email : "none");
    app.navigateTo("dashboard");
    console.log("Teacher dashboard rendered length:", getOrCreateElement("view-content").innerHTML.length);
    app.navigateTo("grading");
    console.log("Teacher grading rendered length:", getOrCreateElement("view-content").innerHTML.length);
    app.navigateTo("attendance");
    console.log("Teacher attendance rendered length:", getOrCreateElement("view-content").innerHTML.length);
} catch (err) {
    console.error("ERROR in Teacher flow:", err);
}


console.log("\nTesting Parent role...");
try {
    authView.selectDemoRole("parent");
    const prUser = store.getCurrentUser();
    console.log("Current user after parent demo:", prUser ? prUser.email : "none");
    app.navigateTo("dashboard");
    console.log("Parent dashboard rendered length:", getOrCreateElement("view-content").innerHTML.length);
    app.navigateTo("child-results");
    console.log("Parent child-results rendered length:", getOrCreateElement("view-content").innerHTML.length);
    app.navigateTo("child-attendance");
    console.log("Parent child-attendance rendered length:", getOrCreateElement("view-content").innerHTML.length);
    app.navigateTo("fees");
    console.log("Parent fees rendered length:", getOrCreateElement("view-content").innerHTML.length);
} catch (err) {
    console.error("ERROR in Parent flow:", err);
}


console.log("\nTesting Admin role...");
try {
    authView.selectDemoRole("admin");
    const admUser = store.getCurrentUser();
    console.log("Current user after admin demo:", admUser ? admUser.email : "none");
    app.navigateToAdminSection("overview");
    console.log("Admin overview rendered length:", getOrCreateElement("admin-view-content").innerHTML.length);
    app.navigateToAdminSection("users");
    console.log("Admin users rendered length:", getOrCreateElement("admin-view-content").innerHTML.length);
} catch (err) {
    console.error("ERROR in Admin flow:", err);
}

console.log("\nAll script executions finished!");
