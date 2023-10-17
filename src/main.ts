import { Floor } from "./model/floor";
import { Freezer } from "./model/freezer";
import { Rack } from "./model/rack";
import { mainScene } from "./scene";

mainScene.render();

mainScene.add(new Floor());
const freezer = new Freezer();
mainScene.addEventListener(freezer, () => freezer.openCloseDoor());
mainScene.add(freezer);
mainScene.render();
// const rack = new Rack();
// mainScene.add(rack);
// rack.showOperationPanel();
