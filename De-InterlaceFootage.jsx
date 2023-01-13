var window = new Window("palette", "De-Interlace footage", undefined);
window.size = [400, 200];

window.orientation = "column";

var titleText = window.add("statictext", undefined, "Select Footage in Project Panel"); 

var generateButton = window.add("button", undefined, "De-Interlace");

window.show();


generateButton.onClick = function() {
    generateComp();
}

function generateComp(){

    if(app.project.activeItem == null || !(app.project.activeItem instanceof FootageItem)) {
        alert("Please select footage first");
        return false;
    }

    var footage = app.project.activeItem;

    var isInterlaceFolder = false;
    var isRenderFolder = false;

    var interlaceFolder;
    var renderFolder;
    //alert(app.project.item[2].name);
    for(var i = 1; i <= app.project.items.length; i++){
        if(app.project.item(i).name == "1_interlace_comps"){
            interlaceFolder = app.project.item(i);
            isInterlaceFolder = true;
        }
        if(app.project.item(i).name == "_RenderComps"){
            renderFolder = app.project.item(i);
            isRenderFolder = true;
        }
    }

    if(!isInterlaceFolder){
        interlaceFolder = app.project.items.addFolder("1_interlace_comps");
    }
    if(!isRenderFolder){
        renderFolder = app.project.items.addFolder("_RenderComps");
    }

    var footageName = footage.name.split(".")[0];
    var compWidth = Math.round(footage.width / 2.25);
    var compHeight = Math.round(footage.height / 2.25);
    var compFolder = app.project.items.addFolder(footageName);

    compFolder.parentFolder = interlaceFolder;
    var interlaceComp = app.project.items.addComp("de-interlace_" + footageName, compWidth, compHeight, 1.0, footage.duration, 30);
    interlaceComp.parentFolder = compFolder;

    var _footage = interlaceComp.layers.add(footage);
    _footage.property("ADBE Transform Group").property("ADBE Scale").setValue([44,44]);
    _footage.Effects.addProperty("ADBE Aud Stereo Mixer");
    _footage.Effects.property("ADBE Aud Stereo Mixer").property(3).setValue(0);
    _footage.Effects.property("ADBE Aud Stereo Mixer").property(4).setValue(0);
    
    var interlaceMask = interlaceComp.layers.addShape();
    interlaceMask.property("ADBE Transform Group").property("ADBE Position").setValue([compWidth / 2, 0.5]);
    var shapeRec = interlaceMask.property("Contents").addProperty("ADBE Vector Shape - Rect");
    shapeRec.property("ADBE Vector Rect Size").setValue([compWidth, 1]);
    var shapeFill = interlaceMask.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    shapeFill.property("ADBE Vector Fill Color").setValue([0,0,0]);
    var shapeRepeater = interlaceMask.property("Contents").addProperty("ADBE Vector Filter - Repeater");
    shapeRepeater.property("ADBE Vector Repeater Copies").setValue(300);
    shapeRepeater.property("ADBE Vector Repeater Transform").property("Position").setValue([0, 2]);

    _footage.setTrackMatte(interlaceMask, TrackMatteType.ALPHA);

    var compileComp = app.project.items.addComp("compile_" + footageName, compWidth, compHeight, 1.0, footage.duration, 30);
    compileComp.parentFolder = compFolder;

    var blurCompLayer = compileComp.layers.add(interlaceComp);
    var mainCompLayer = compileComp.layers.add(interlaceComp);

    blurCompLayer.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-48,-48]);

    blurCompLayer.Effects.addProperty("ADBE Motion Blur");
    blurCompLayer.Effects.property("ADBE Motion Blur").property(2).setValue(1);
    blurCompLayer.Effects.addProperty("ADBE Easy Levels2");
    blurCompLayer.Effects.property("ADBE Easy Levels2").property(1).setValue(5);
    blurCompLayer.Effects.property("ADBE Easy Levels2").property(4).setValue(0);

    var renderComp = app.project.items.addComp(footageName, compWidth, compHeight, 1.0, footage.duration, 30);
    renderComp.parentFolder = renderFolder;

    var compileCompLayer = renderComp.layers.add(compileComp);

    compileCompLayer.Effects.addProperty("ADBE Vibrance");
    compileCompLayer.Effects.property("ADBE Vibrance").property(1).setValue(75);
    
    

    renderComp.openInViewer();

}