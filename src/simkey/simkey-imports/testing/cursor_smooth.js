// Moves cursor from (x1,y1) to (x2,y2) smoothly, given steps that are 50 by default
function cursor_smooth (info, x1, y1, x2, y2, steps = 50, wait = 10) {
    let movementStr = `c${x1},${y1}`
  
    // Calculate the step increments for x and y based on the number of steps
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;
  
    // Generate each position along the path
    for (let i = 1; i <= steps; i++) {
      const x = Math.round(x1 + dx * i)
      const y = Math.round(y1 + dy * i)
      movementStr += `\nc${x},${y}\nw${wait}`
    }
  
    return movementStr
}

module.exports = { FUNCTION: cursor_smooth, TAKES: { PARAMS: "[NUM,NUM,NUM,NUM,NUM:OPTIONAL,NUM]", BLOCK: false } }