import { Floor } from "./model/floor";
import { Rack } from "./model/rack";
import { mainScene } from "./scene";

mainScene.render();

mainScene.add(new Floor());

const rack = new Rack();
mainScene.add(rack);
rack.showOperationPanel();
