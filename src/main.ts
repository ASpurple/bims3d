import { Room } from "./model/room";
import { mainScene } from "./scene";

const room = new Room();
room.showOperationPanel();
mainScene.add(room);
mainScene.render();
