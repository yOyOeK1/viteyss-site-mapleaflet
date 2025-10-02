function getColorToDepth( depth, onlyAlpha = false ){
    let dep,r,g,b,a=1.0;
    if( depth<10.0 && depth>2.2 ){
        dep = ((depth-2.2)/7.8);
        r = dep;
        g = 0.5+(dep*0.5);
        b = 0.75+(dep*0.25);
        //a= 105;
        
    }else if( depth <=2.2 ){
        dep = ((depth-2.2)/8.8)*0.9;
        r = 0.75;
        g = 0.75;
        b = 0.99;
        a=1.0;

    }else if( depth>=10.0 ){
        r = 1;
        g = 1;
        b = 1;
        
    }

    if( depth >= 5.0 ){
        a = 5.0/parseFloat( depth );
        //console.log(`depth: ${depth} a:${a}`)
    }
    if( a < 0.0  )
        a = 0.0;
    else if( a > 1.0 )
        a= 1.0;

    return {
        alpha: parseFloat(a).toFixed(2),
        rgb: `rgb(${parseInt(r*255.00)},${parseInt(g*255.00)},${parseInt(b*255.00)})`
    };
}



function getColor(b,points) {
  //const points = [
  //  [0, '#ffea6f'],
  //  [2.2, '#73bcc7'],
  //  [10.0, '#eef9fa']
  //];

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return [r, g, b];
  };

  // Helper function to convert RGB to hex
  const rgbToHex = (r, g, b) => {
    const toHex = (c) => Math.round(c).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Find the two points b falls between
  let startPoint, endPoint;
  for (let i = 0; i < points.length - 1; i++) {
    if (b >= points[i][0] && b <= points[i + 1][0]) {
      startPoint = points[i];
      endPoint = points[i + 1];
      break;
    }
  }

  // If b is outside the range, return the closest endpoint's color
  if (!startPoint) {
    if (b < points[0][0]) {
      return points[0][1];
    } else {
      return points[points.length - 1][1];
    }
  }

  // Linear interpolation formula
  const [x1, hex1] = startPoint;
  const [x2, hex2] = endPoint;

  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);

  const t = (b - x1) / (x2 - x1);

  const r = r1 + (r2 - r1) * t;
  const g = g1 + (g2 - g1) * t;
  const b_interp = b1 + (b2 - b1) * t;

  return rgbToHex(r, g, b_interp);
}
/*
// Example usage:
const value = 5.0;
const interpolatedColor = getColor(value);
console.log(`The interpolated color for ${value} is: ${interpolatedColor}`);

// Example with a value at a key point
const value2 = 2.2;
const directColor = getColor(value2);
console.log(`The color for ${value2} (a key point) is: ${directColor}`);
*/


export{ getColorToDepth, getColor }