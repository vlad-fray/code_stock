enum ELocalStorageFields {
    someField = 'SomeField',
}

const getLocalStorageField = (field: ELocalStorageFields) => {
    return localStorage.getItem(field);
};

const setLocalStorageField = (field: ELocalStorageFields, data: string) => {
    return localStorage.setItem(field, data);
};

const removeLocalStorageField = (field: ELocalStorageFields) => {
    return localStorage.removeItem(field);
};

export {
    getLocalStorageField,
    setLocalStorageField,
    removeLocalStorageField,
    ELocalStorageFields,
};