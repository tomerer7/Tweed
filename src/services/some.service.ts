import logger from "../utils/Logger";

class SomeService {

    constructor() {}
  
    async createSomething(): Promise<boolean> {
        logger.debug(`Something has been created.`);
        return true;
    }
}

export const someService = new SomeService();