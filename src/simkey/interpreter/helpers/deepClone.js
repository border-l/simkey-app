// Function to deep clone object
function deepClone(obj) {
    // Nothing to clone
    if (obj === null || typeof obj !== 'object') {
        return obj
    }

    // Clone elements in array recursively
    if (Array.isArray(obj)) {
        return obj.map(deepClone)
    }

    // Otherwise, this is a non-array object
    const clonedObj = {}

    // Clone each value
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key])
        }
    }

    return clonedObj
}

module.exports = deepClone