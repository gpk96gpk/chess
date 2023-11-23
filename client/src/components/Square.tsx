//TODO:
// Square component takes in the props for position children and handleDrop


// passed in function handleDropWrapper takes in event and sets piece to the event dataTransfer
//passes piece that was take from event and position to handleDrop function

// render div with onDrop and onDragOver events
//onDrop event calls handleDropWrapper function
//onDragOver event prevents default behavior
// render children
const Square = ({ position, highlightedTiles, handleDragStart, handleDragOver, handleDrop, children }) => {
    const isHighlighted = highlightedTiles.some(([x, y]) => x === position[0] && y === position[1]);

    const squareStyle = isHighlighted ? { 
        backgroundImage: 'radial-gradient(circle at center, rgba(0, 255, 0, 0.5) 0%, transparent 70%, transparent 100%)' 
    } : {};

    const onDragStart = (event) => handleDragStart(event, position);
    const onDragOver = (event) => handleDragOver(event, position);
    const onDrop = (event) => handleDrop(event, position);

    return (
        <div 
            className='square'
            style={squareStyle}
            draggable={!!children}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {children}
        </div>
    );
};

export default Square;