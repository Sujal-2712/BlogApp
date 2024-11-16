// Store value in sessionStorage
const storeInSession = (key, value) => {
    if (key && value !== undefined) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }
};

// Retrieve value from sessionStorage
const lockInSession = (key) => {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
};

// Remove value from sessionStorage
const removeFromSession = (key) => {
    if (key) {
        sessionStorage.removeItem(key);
    }
};

// Clear all sessionStorage
const logoutUser = () => {
    sessionStorage.clear();
};

export {
    storeInSession,
    lockInSession,
    removeFromSession,
    logoutUser
};
