import { Floor } from "./model/floor";
import { Rack } from "./model/rack";
import { SubRack } from "./model/sub_rack";
import { mainScene } from "./scene";

mainScene.render();

mainScene.add(new Floor());

mainScene.add(new SubRack());

mainScene.add(new Rack());
