// Checks whether token is changing sections
module.exports = (context, token) => {
    return context.model.hasOwnProperty(token.substring(1, token.length - 1)) &&
           token.charAt(0) === "<" &&
           token.charAt(token.length - 1) === ">"
}