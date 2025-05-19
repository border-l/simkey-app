// Empty class for marking simkey strings as opposed to strings that start and end with \", checking using instanceof
class STRING_MARKER {
    constructor(string) { 
        this.string = string
    }
    get() {
        return this.string
    }
}

module.exports = STRING_MARKER