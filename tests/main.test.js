const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function createClassList(initial = []) {
    const set = new Set(initial);
    return {
        add: (...names) => names.forEach((n) => set.add(n)),
        remove: (...names) => names.forEach((n) => set.delete(n)),
        contains: (name) => set.has(name),
    };
}

function createElement(id, value = '') {
    const listeners = {};
    const element = {
        id,
        value,
        textContent: '',
        offsetTop: 0,
        style: {},
        classList: createClassList(),
        parentElement: null,
        addEventListener: (event, handler) => {
            listeners[event] = handler;
        },
        trigger: () => {},
        remove() {
            this.removed = true;
        },
        querySelectorAll: () => [],
    };
    element.trigger = (event, payload = {}) => {
        if (listeners[event]) listeners[event].call(element, payload);
    };
    return element;
}

function setupContext() {
    const code = fs.readFileSync('/home/runner/work/ReChain-Oil/ReChain-Oil/assets/js/main.js', 'utf8');
    const elements = {};
    const formSteps = {};
    const selectors = {};
    const windowListeners = {};
    let querySelectorAllHandler = () => [];
    let lastAlert = null;
    const timeouts = [];
    const storage = {};
    let alertMessage = null;
    let scrollToArgs = null;
    let collapseHideCalled = false;

    const document = {
        addEventListener: () => {},
        querySelectorAll: (selector) => querySelectorAllHandler(selector),
        getElementById: (id) => elements[id] || null,
        querySelector: (selector) => {
            const match = selector.match(/\.form-step\[data-step="(\d+)"\]/);
            if (match) return formSteps[match[1]] || null;
            if (selector === '.alert') return lastAlert;
            if (selectors[selector]) return selectors[selector];
            return null;
        },
        body: {
            classList: createClassList(),
            insertAdjacentHTML: (_position, html) => {
                if (html.includes('id="loadingOverlay"')) {
                    elements.loadingOverlay = createElement('loadingOverlay');
                }
                if (html.includes('class="alert')) {
                    lastAlert = createElement('generatedAlert');
                    lastAlert.classList.add('alert', 'show');
                }
            },
        },
    };

    const window = {
        addEventListener: (event, cb) => {
            if (!windowListeners[event]) windowListeners[event] = [];
            windowListeners[event].push(cb);
        },
        scrollTo: (args) => {
            scrollToArgs = args;
        },
        location: { href: 'index.html' },
        history: { replaceState: () => {} },
        innerWidth: 1200,
        scrollY: 0,
    };

    const localStorage = {
        getItem: (key) => (Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null),
        setItem: (key, value) => {
            storage[key] = String(value);
        },
        removeItem: (key) => {
            delete storage[key];
        },
    };

    const context = {
        document,
        window,
        localStorage,
        console,
        setTimeout: (fn) => {
            timeouts.push(fn);
            return timeouts.length;
        },
        clearTimeout: () => {},
        requestAnimationFrame: (fn) => fn(),
        IntersectionObserver: function () {
            this.observe = () => {};
        },
        bootstrap: { Collapse: function () { this.hide = () => { collapseHideCalled = true; }; } },
        Chart: function () {},
        AOS: { init: () => {} },
        Date,
        alert: (message) => {
            alertMessage = message;
        },
    };

    vm.createContext(context);
    vm.runInContext(code, context, { filename: '/home/runner/work/ReChain-Oil/ReChain-Oil/assets/js/main.js' });

    return {
        context,
        elements,
        formSteps,
        selectors,
        storage,
        setQuerySelectorAll: (handler) => {
            querySelectorAllHandler = handler;
        },
        getAlertMessage: () => alertMessage,
        wasCollapseHideCalled: () => collapseHideCalled,
        getScrollToArgs: () => scrollToArgs,
        triggerWindowEvent: (event) => {
            (windowListeners[event] || []).forEach((cb) => cb());
        },
        flushTimers: () => {
            let guard = 0;
            while (timeouts.length > 0) {
                guard += 1;
                if (guard > 20) throw new Error('Too many queued timers');
                const fn = timeouts.shift();
                fn();
            }
        },
    };
}

test('saveToLocalStorage appends data to existing array', () => {
    const { context, storage } = setupContext();
    storage.items = JSON.stringify([{ id: 1 }]);

    const result = context.saveToLocalStorage('items', { id: 2 });

    assert.equal(result, true);
    assert.deepEqual(JSON.parse(storage.items), [{ id: 1 }, { id: 2 }]);
});

test('saveToLocalStorage returns false on invalid stored JSON', () => {
    const { context, storage } = setupContext();
    storage.items = '{bad-json';

    const result = context.saveToLocalStorage('items', { id: 2 });

    assert.equal(result, false);
});

test('updateProgressBar updates width and step text', () => {
    const { context, elements } = setupContext();
    elements.progressBar = createElement('progressBar');
    elements.progressBar.style = {};
    elements.progressText = createElement('progressText');
    vm.runInContext('currentStep = 2;', context);

    context.updateProgressBar();

    assert.equal(elements.progressBar.style.width, '50%');
    assert.equal(elements.progressText.textContent, 'Langkah 2 dari 4');
});

test('nextStep blocks when required fields are empty', () => {
    const { context, formSteps } = setupContext();
    const requiredInput = createElement('requiredInput', '');
    const step1 = createElement('step1');
    step1.querySelectorAll = () => [requiredInput];
    step1.classList = createClassList(['active']);
    formSteps['1'] = step1;
    let notification = null;
    context.showNotification = (message, type) => {
        notification = { message, type };
    };

    context.nextStep();

    assert.equal(vm.runInContext('currentStep', context), 1);
    assert.equal(requiredInput.classList.contains('is-invalid'), true);
    assert.deepEqual(notification, {
        message: 'Mohon lengkapi semua field yang wajib diisi',
        type: 'error',
    });
});

test('nextStep validates password confirmation on step 1', () => {
    const { context, elements, formSteps } = setupContext();
    const requiredInput = createElement('requiredInput', 'filled');
    const step1 = createElement('step1');
    step1.querySelectorAll = () => [requiredInput];
    step1.classList = createClassList(['active']);
    formSteps['1'] = step1;
    elements.regPassword = createElement('regPassword', '123456');
    elements.regConfirmPassword = createElement('regConfirmPassword', '654321');
    elements.passwordMatchFeedback = createElement('passwordMatchFeedback');
    let notification = null;
    context.showNotification = (message, type) => {
        notification = { message, type };
    };

    context.nextStep();

    assert.equal(vm.runInContext('currentStep', context), 1);
    assert.equal(elements.regConfirmPassword.classList.contains('is-invalid'), true);
    assert.equal(elements.passwordMatchFeedback.textContent, 'Konfirmasi password harus sama');
    assert.deepEqual(notification, {
        message: 'Password dan konfirmasi password tidak cocok!',
        type: 'error',
    });
});

test('handleContactSubmit marks form invalid when checkValidity fails', () => {
    const { context } = setupContext();
    const form = createElement('contactForm');
    form.checkValidity = () => false;
    form.classList = createClassList();
    let stopped = false;
    const event = {
        target: form,
        preventDefault: () => {},
        stopPropagation: () => {
            stopped = true;
        },
    };

    context.handleContactSubmit(event);

    assert.equal(stopped, true);
    assert.equal(form.classList.contains('was-validated'), true);
});

test('handleContactSubmit saves submission and redirects on success', () => {
    const { context, elements, storage, flushTimers } = setupContext();
    elements.contactName = createElement('contactName', 'Test');
    elements.contactEmail = createElement('contactEmail', 'test@example.com');
    elements.contactPhone = createElement('contactPhone', '08123');
    elements.contactLocation = createElement('contactLocation', 'Jakarta');
    elements.contactPurpose = createElement('contactPurpose', 'Join');
    elements.contactMessage = createElement('contactMessage', 'Hello');
    const form = createElement('contactForm');
    form.checkValidity = () => true;
    const event = {
        target: form,
        preventDefault: () => {},
        stopPropagation: () => {},
    };

    context.handleContactSubmit(event);
    flushTimers();

    const records = JSON.parse(storage.contactSubmissions);
    assert.equal(records.length, 1);
    assert.equal(records[0].email, 'test@example.com');
    assert.equal(context.window.location.href, 'success.html');
});

test('handlePartnerRegistrationSubmit requires PIC selection', () => {
    const { context, elements } = setupContext();
    elements.isPICError = createElement('isPICError');
    elements.isPICError.style.display = 'none';
    const form = createElement('partnerRegistrationForm');
    form.checkValidity = () => true;
    context.document.querySelector = (selector) => {
        if (selector === 'input[name="isPIC"]:checked') return null;
        return null;
    };
    const event = {
        target: form,
        preventDefault: () => {},
        stopPropagation: () => {},
    };

    context.handlePartnerRegistrationSubmit(event);

    assert.equal(elements.isPICError.style.display, 'block');
});

test('handlePartnerRegistrationSubmit shows alert for password mismatch', () => {
    const { context, elements, getAlertMessage } = setupContext();
    elements.isPICError = createElement('isPICError');
    elements.partnerPassword = createElement('partnerPassword', '123456');
    elements.partnerConfirmPassword = createElement('partnerConfirmPassword', 'abcdef');
    context.document.querySelector = (selector) => {
        if (selector === 'input[name="isPIC"]:checked') return { value: 'yes' };
        return null;
    };
    const form = createElement('partnerRegistrationForm');
    form.checkValidity = () => true;
    const event = {
        target: form,
        preventDefault: () => {},
        stopPropagation: () => {},
    };

    context.handlePartnerRegistrationSubmit(event);

    assert.equal(getAlertMessage(), 'Password dan Konfirmasi Password tidak sama!');
});

test('handlePartnerRegistrationSubmit saves partner data and redirects', () => {
    const { context, elements, storage, flushTimers } = setupContext();
    elements.isPICError = createElement('isPICError');
    elements.partnerPassword = createElement('partnerPassword', '123456');
    elements.partnerConfirmPassword = createElement('partnerConfirmPassword', '123456');
    elements.companyName = createElement('companyName', 'CV Maju');
    elements.picName = createElement('picName', 'Budi');
    elements.partnerEmail = createElement('partnerEmail', 'mitra@example.com');
    elements.whatsappNumber = createElement('whatsappNumber', '08111');
    elements.oilAmount = createElement('oilAmount', '100');
    elements.oilPeriod = createElement('oilPeriod', 'weekly');
    elements.address = createElement('address', 'Bandung');
    elements.notes = createElement('notes', 'Catatan');
    context.document.querySelector = (selector) => {
        if (selector === 'input[name="isPIC"]:checked') return { value: 'yes' };
        return null;
    };
    const form = createElement('partnerRegistrationForm');
    form.checkValidity = () => true;
    const event = {
        target: form,
        preventDefault: () => {},
        stopPropagation: () => {},
    };

    context.handlePartnerRegistrationSubmit(event);
    flushTimers();

    const records = JSON.parse(storage.partnerRegistrations);
    assert.equal(records.length, 1);
    assert.equal(records[0].companyName, 'CV Maju');
    assert.equal(context.window.location.href, 'login.html');
});

test('initializeNavbar toggles scrolled classes and collapses mobile menu', () => {
    const { context, selectors, setQuerySelectorAll, triggerWindowEvent, wasCollapseHideCalled } = setupContext();
    const navbar = createElement('navbar');
    const collapse = createElement('navbarCollapse');
    const navLink = createElement('link1');
    selectors['.navbar'] = navbar;
    selectors['.navbar-collapse'] = collapse;
    setQuerySelectorAll((selector) => (selector === '.nav-link' ? [navLink] : []));
    context.window.innerWidth = 768;

    context.initializeNavbar();
    context.window.scrollY = 100;
    triggerWindowEvent('scroll');
    navLink.trigger('click');

    assert.equal(navbar.classList.contains('scrolled'), true);
    assert.equal(navbar.classList.contains('shadow'), true);
    assert.equal(wasCollapseHideCalled(), true);
});

test('initializeBackToTop toggles button visibility and scrolls to top', () => {
    const { context, elements, triggerWindowEvent, getScrollToArgs } = setupContext();
    const backToTop = createElement('backToTop');
    elements.backToTop = backToTop;

    context.initializeBackToTop();
    context.window.scrollY = 500;
    triggerWindowEvent('scroll');
    backToTop.trigger('click');

    assert.equal(backToTop.classList.contains('show'), true);
    assert.equal(JSON.stringify(getScrollToArgs()), JSON.stringify({ top: 0, behavior: 'smooth' }));
});

test('initializeSmoothScroll prevents default and scrolls to anchor target', () => {
    const { context, selectors, setQuerySelectorAll, getScrollToArgs } = setupContext();
    const anchor = createElement('anchor');
    anchor.getAttribute = () => '#target';
    const target = createElement('target');
    target.offsetTop = 300;
    selectors['#target'] = target;
    setQuerySelectorAll((selector) => (selector === 'a[href^="#"]' ? [anchor] : []));
    let prevented = false;

    context.initializeSmoothScroll();
    anchor.trigger('click', {
        preventDefault: () => {
            prevented = true;
        },
    });

    assert.equal(prevented, true);
    assert.equal(JSON.stringify(getScrollToArgs()), JSON.stringify({ top: 220, behavior: 'smooth' }));
});

test('prevStep moves back one step and updates progress', () => {
    const { context, formSteps, elements } = setupContext();
    elements.progressBar = createElement('progressBar');
    elements.progressBar.style = {};
    elements.progressText = createElement('progressText');
    const step1 = createElement('step1');
    const step2 = createElement('step2');
    step1.classList = createClassList();
    step2.classList = createClassList(['active']);
    formSteps['1'] = step1;
    formSteps['2'] = step2;
    vm.runInContext('currentStep = 2;', context);

    context.prevStep();

    assert.equal(vm.runInContext('currentStep', context), 1);
    assert.equal(step2.classList.contains('active'), false);
    assert.equal(step1.classList.contains('active'), true);
    assert.equal(elements.progressBar.style.width, '25%');
});

test('saveCurrentStepData stores form values for each step', () => {
    const { context, elements } = setupContext();
    elements.regName = createElement('regName', 'Nama');
    elements.regEmail = createElement('regEmail', 'user@mail.com');
    elements.regPhone = createElement('regPhone', '08111');
    elements.regPassword = createElement('regPassword', '123456');
    elements.regConfirmPassword = createElement('regConfirmPassword', '123456');
    elements.regAddress = createElement('regAddress', 'Jalan A');
    elements.regIdentity = createElement('regIdentity', 'KTP');
    elements.regEmergency = createElement('regEmergency', '08122');
    elements.regNotes = createElement('regNotes', 'Catatan');
    vm.runInContext('registrationData = {}; currentStep = 1;', context);
    context.saveCurrentStepData();
    vm.runInContext('currentStep = 2;', context);
    context.saveCurrentStepData();
    vm.runInContext('currentStep = 3;', context);
    context.saveCurrentStepData();

    const registrationData = vm.runInContext('registrationData', context);
    assert.equal(registrationData.name, 'Nama');
    assert.equal(registrationData.address, 'Jalan A');
    assert.equal(registrationData.emergency, '08122');
});

test('populateReview writes registration data with fallback dash', () => {
    const { context, elements } = setupContext();
    elements.reviewName = createElement('reviewName');
    elements.reviewEmail = createElement('reviewEmail');
    elements.reviewPhone = createElement('reviewPhone');
    elements.reviewAddress = createElement('reviewAddress');
    elements.reviewIdentity = createElement('reviewIdentity');
    elements.reviewEmergency = createElement('reviewEmergency');
    vm.runInContext('registrationData = { name: "Ani", email: "", phone: "0800", address: "", identity: "KTP", emergency: "" };', context);

    context.populateReview();

    assert.equal(elements.reviewName.textContent, 'Ani');
    assert.equal(elements.reviewEmail.textContent, '-');
    assert.equal(elements.reviewIdentity.textContent, 'KTP');
});

test('handleRegistrationSubmit stores registration and redirects to login', () => {
    const { context, storage, flushTimers } = setupContext();
    vm.runInContext('registrationData = { name: "Rina", email: "rina@mail.com" };', context);
    const event = {
        preventDefault: () => {},
    };

    context.handleRegistrationSubmit(event);
    flushTimers();

    const records = JSON.parse(storage.registrations);
    assert.equal(records.length, 1);
    assert.equal(records[0].status, 'active');
    assert.equal(records[0].balance, 0);
    assert.equal(context.window.location.href, 'login.html');
});
