({
    "plugins": ["jsdom-quokka-plugin"]
})

const attr = attribute => value => el => el.setAttribute( attribute, value ),
      newEl = elName => document.createElementNS( 'http://www.w3.org/2000/svg', elName ),
      keys = obj => Object.keys( obj )
      forEach = func => arr => arr.forEach( func )
      forEachKey = func => obj => forEach( func )( keys( obj ) )
      newElAttr = elName => attributes => {
        const el = newEl( elName )
        forEachKey( key => attr( key )( attributes[ key ] )( el ) )( attributes )
        return el
      }
      svg = w => h => newElAttr( 'svg' )( { width: w, height: h } ),
      curveColor = 'blue',
      curveStrokeWidth = 2,
      circleColor = 'red',
      circleRadius = 6,
      qCurve = ( sx, sy ) => ( mx, my ) => ( ex, ey ) => `M${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`,
      circle = x => y => newElAttr( 'circle' )( { cx: x, cy: y, r: circleRadius, stroke: circleColor, fill: circleColor } ),
      path = attributes => newElAttr( 'path')( attributes ),
      line = ( sx, sy ) => (...points) => `M${sx} ${sy} ${points.reduce( (t,c,i) => i%2==0 ? `${t}L ${c} ` : `${t}${c} `, '' )}`.trim(),
      appendChildren = (...elList) => parent => elList.forEach( el => parent.appendChild( el ) ),
      abs = val => Math.abs( val )

let gw = window.innerWidth * 0.5,
    gh = window.innerHeight * 0.85,
    ySlider = y => {
      const el = circle( gw * 0.5 )( y )
      attr( 'draggable' )( true )( el )
      return el
    }

function quadraticGraph() {
   let offsetY = 0
  const graph = svg( gw )( gh ),
        quadraticCurve = path( {
          d: qCurve( 0, gh * 0.5 )( gw * 0.5, gh * 0.5 )( gw, gh * 0.5 ),
          fill: 'transparent',
          stroke: 'blue'
        } ),
        curveAdjuster = ySlider( gh * 0.5 ),
        dashedLine = path( {
          d: line( 0, gh * 0.5 )( gw * 0.5, gh * 0.5, gw, gh * 0.5 ),
          stroke: 'red', 'stroke-dasharray': '4,4',
          fill: 'transparent'
        } ),
        updateGraph = el => offset => {
          if ( abs( offset ) > el.parentElement.clientHeight / 2 )
            return
          const pos = ( gh * 0.5 ) + offset
          offsetY = offset
          attr( 'width' )( gw )( el.parentElement )
          attr( 'height' )( gh )( el.parentElement )
          attr( 'cy' )( pos )( el )
          attr( 'cx' )( gw * 0.5 )( el )
          attr( 'd' )( line( 0, gh * 0.5 )( gw * 0.5, pos, gw, gh * 0.5 ) )( el.parentElement.children[ 0 ] )
          attr( 'd' )( qCurve( 0, gh * 0.5 )( gw * 0.5, pos )( gw, gh * 0.5 ) )( el.parentElement.children[ 1 ] )
        },
        dragY = el => event => {
          if ( event.touches )
            event.pageY = event.touches[ 0 ].pageY
          updateGraph( el )( event.pageY - ( window.innerHeight / 2 ) )
        },
        curveAdjusterDragY = dragY( curveAdjuster )

  curveAdjuster.addEventListener( 'mousedown', () => document.addEventListener( 'mousemove',curveAdjusterDragY ) )
  curveAdjuster.addEventListener( 'touchstart', () => document.addEventListener( 'touchmove',curveAdjusterDragY ) )
  document.addEventListener( 'mouseup', () => document.removeEventListener( 'mousemove', curveAdjusterDragY ) )
  document.addEventListener( 'touchend', () => document.removeEventListener( 'touchmove', curveAdjusterDragY ) )
  document.addEventListener( 'DOMContentLoaded', main )
  window.addEventListener( 'resize', () => {
    gw = window.innerWidth * 0.5
    gh = window.innerHeight * 0.85
    updateGraph( curveAdjuster )( offsetY )
  } )
  
  appendChildren( dashedLine, quadraticCurve, curveAdjuster )( graph )
  document.body.appendChild( graph )
}

function main() {
  quadraticGraph()
  
}

// main()

document.addEventListener( 'DOMContentLoaded', main )