# automatic generation of some javascript files in RedBlueLines
all: rbl-edit_exe.js
rbl-edit_exe.js: rbl-edit_exe.copyright RblTemplate.js RblCanvas.js rbl-segments.js RblEyes.js RblLineStyle.js rbl-editor.js 
	cat $^ > $@
