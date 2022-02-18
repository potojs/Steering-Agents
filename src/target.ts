import { Agent, ShowOptions } from "./agent";

export class Target extends Agent {
    show(
        size: number = 1,
        showOption: ShowOptions = ShowOptions.TARGET,
    ) {
        super.show(size, showOption);
        return this;
    }
    update() {
        super.update();
        const colls = this.getCollisions(40);
        if(colls.length > 0) {
            this.kill();
        }
        return this;
    }
}
