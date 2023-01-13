var window = new Window("palette", "Generate Comp from Spritesheet", undefined);
window.size = [400, 200];

window.orientation = "column";

var titleText = window.add("statictext", undefined, "Select Spritesheet in Project Panel"); 
var directions = window.add("statictext", undefined, "Input Columns and Rows"); 
var inputGroup = window.add("group", undefined);
inputGroup.orientation = "row";
var columnLabel = inputGroup.add("statictext", undefined, "Columns");
var columns = inputGroup.add("edittext", undefined, "5");
var rowLabel = inputGroup.add("statictext", undefined, "Rows");
var rows = inputGroup.add("edittext", undefined, "5");
var framerateLabel = inputGroup.add('statictext', undefined, "Frame Rate");
var framerate = inputGroup.add("edittext", undefined, "30");

var generateButton = window.add("button", undefined, "Generate Comp");

window.show();


generateButton.onClick = function() {
    generateComp();
}

function generateComp(){
    var _columns = Number(columns.text);
    var _rows = Number(rows.text);
    var _framerate = Number(framerate.text);

    if(app.project.activeItem == null || !(app.project.activeItem instanceof FootageItem)) {
        alert("Please select a spritesheet first");
        return false;
    }
    if(columns.text == null || rows.text == null || _columns == 0 || _rows == 0){
        alert("Please input columns and rows");
        return false;
    }
    var spritesheet = app.project.activeItem;



    var compWidth = Math.round(spritesheet.width / _columns);
    var compHeight = Math.round(spritesheet.height / _rows);
    var compDuration = (_columns * _rows) / _framerate;
    var spritesheetComp = app.project.items.addComp(spritesheet.name, compWidth, compHeight, 1.0, compDuration, _framerate);
    spritesheetComp.parentFolder = spritesheet.parentFolder;

    var _spritesheet = spritesheetComp.layers.add(spritesheet);

    _spritesheet.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([0,0]);
    _spritesheet.property("ADBE Transform Group").property("ADBE Position").setValue([0,0]);

    _spritesheet.Effects.addProperty("ADBE Slider Control");
    _spritesheet.Effects.property("ADBE Slider Control").name = "Playback Speed";
    _spritesheet.Effects.property("ADBE Slider Control").property(1).setValue(1);

    _spritesheet.property("ADBE Transform Group").property("ADBE Position").expression = "let spriteSheetWidth = " + _columns + "; let spriteSheetRows = " + _rows + "; let playbackSpeed = effect('Playback Speed')('Slider'); let compWidth = thisComp.width; let compHeight = thisComp.height; let frame = Math.floor(timeToFrames(time) * playbackSpeed); let x_pos = frame % spriteSheetWidth; let y_pos = Math.floor((frame % (spriteSheetWidth * spriteSheetRows)) / spriteSheetWidth); [x_pos * -compWidth, y_pos * -compHeight]";

    spritesheetComp.openInViewer();
};
