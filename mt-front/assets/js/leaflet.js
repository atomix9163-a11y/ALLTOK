const categoryTitleBoldColor = [
    'orange',
    'green',
    'wine',
    'yelow',
    'blue',
    'brown',    
]

const getCategoryRandomColor = () => {
    const colorIndex = Math.floor(Math.random() * categoryTitleBoldColor.length);
    return categoryTitleBoldColor[colorIndex];
}