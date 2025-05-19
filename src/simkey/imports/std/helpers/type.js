const getVectorNumber = require("../../../interpreter/types/getVectorNumber")

// Types a string out (this overcomes the restriction of not being able to have repeats)
async function type(INFO, string, time = 10) {
    if (!isNaN(string) && typeof string === "number") {
        await typeString(INFO.ROBOT, String(string), time)
        return
    }

    segments = String(string).split(" ").map((val, i, arr) => i < arr.length - 1 ? val += " " : val)

    // Loop through each segment
    for (let i = 0; i < segments.length; i++) {
        segment = segments[i]

        // Variable syntax (%$var%)
        if (segment[0] === "%" && segment.lastIndexOf("%") > 0) {
            let variable = segment.slice(1, segment.indexOf("%", 1))
            let varValue = INFO.CONTEXT.variables[variable]

            // Split segment up in case there's more variables
            segments.splice(i + 1, 0, segment.slice(variable.length + 2))
            segment = "%" + variable + "%"

            // Non-indexed variable
            if (varValue !== undefined) {
                if (Array.isArray(varValue)) await typeString(INFO.ROBOT, String(varValue[0]), time)
                else await typeString(INFO.ROBOT, String(varValue), time)
                continue
            }

            // Check vector
            const vector = getVectorNumber(INFO.CONTEXT, variable, true, true)
            if (vector !== false) {
                await typeString(INFO.ROBOT, String(vector), time)
                continue
            }
        }

        // Regular string
        await typeString(INFO.ROBOT, segment, time)
    }
}

// Types the segment out
async function typeString(ROBOT, string, time) {
    const special = { " ": "SPACE", "\n": "ENTER", "\r": "ENTER", "\t": "TAB", "\b": "BACK" }
    for (let i = 0; i < string.length; i++) {
        await ROBOT.sleep(time)
        await ROBOT.send([(special[string[i]]) ? special[string[i]] : string[i], true])
        await ROBOT.send([(special[string[i]]) ? special[string[i]] : string[i], false])
        await ROBOT.sleep(time)
    }
}

module.exports = { FUNCTION: type, TAKES: { PARAMS: "[NUM | STR, NUM:OPTIONAL]", BLOCK: false } }