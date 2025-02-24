// Splits the script into tokens
module.exports = (context) => {
    const regex = /([ \t\n\r])/g
    context.update('tokens', context.script.split(regex).filter(token => token.length > 0 && token !== ' ' && token !== "\n" && token !== '\t' && token !== '\r'))
}