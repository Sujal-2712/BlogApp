// Store value in sessionStorage
const storeInSession = (key, value) => {
    try {
        if (!key || value === undefined) {
            throw new Error("Both key and value are required to store in session.");
        }
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        console.error(`Error storing in session: ${err.message}`);
    }
};

// Retrieve value from sessionStorage
const lockInSession = (key) => {
    try {
        if (!key) {
            throw new Error("Key is required to retrieve from session.");
        }
        const item = sessionStorage.getItem(key);
        if (!item) {
            throw new Error(`No data found in session for key: ${key}`);
        }
        const result=JSON.parse(item);

        return result;
    } catch (err) {
        console.error(`Error retrieving from session: ${err.message}`);
        return null;
    }
};

// Remove value from sessionStorage
const removeFromSession = (key) => {
    try {
        if (!key) {
            throw new Error("Key is required to remove from session.");
        }
        sessionStorage.removeItem(key);
    } catch (err) {
        console.error(`Error removing from session: ${err.message}`);
    }
};

// Clear all sessionStorage
const logoutUser = () => {
    try {
        sessionStorage.clear();
    } catch (err) {
        console.error(`Error clearing session: ${err.message}`);
    }
};

export {
    storeInSession,
    lockInSession,
    removeFromSession,
    logoutUser
};
