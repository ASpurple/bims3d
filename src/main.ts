import { addPipeButton } from "./html/pipe_buttons";
import { Floor } from "./model/floor";
import { PipeModel } from "./model/pipe";
import { Rack } from "./model/rack";
import { SubRack } from "./model/sub_rack";
import { mainScene } from "./scene";

mainScene.render();

mainScene.add(new Floor());

const subRack = new SubRack();
addPipeButton(subRack);
mainScene.add(subRack);

// mainScene.add(new Rack());

// mainScene.add(new PipeModel());
