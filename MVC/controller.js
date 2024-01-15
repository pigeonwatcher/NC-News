class Controller {

    constructor(model) {
        this.model = model;
    }

    async getTopics(req, res, next) {

        try {
            const { fetchAllTopics } = this.model;
            const topics = await fetchAllTopics();
            res.status(200).send(topics);

        } catch(err) {
            console.log(err);
            next(err);
        }
    }
}

module.exports = Controller;