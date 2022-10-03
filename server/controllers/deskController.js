const { DB, Desks } = $.deskive;

const checkDocExists = function (doc, res) {
    if (doc) return true;
    else return res.status(404).json({
        status: 'fail',
        message: 'No document found'
    });
};

const getAllDesks = async (req, res) => {
    res.status(200).json({
        status: 'success',
        length: Desks.docs.length,
        data: {
            desks: Desks.docs
        }
    });
};

const getDesk = async (req, res) => {
    const doc = Desks.getOneById(req.params.id);
    if (!checkDocExists(doc, res)) return;

    res.status(200).json({
        status: 'success',
        data: {
            desk: doc
        }
    });
};

const createDesk = async (req, res) => {
    const doc = Desks.create(req.body);
    await DB.save();
    res.status(201).json({
        status: 'success',
        data: {
            desk: doc
        }
    });
};

const updateDesk = async (req, res) => {
    const doc = Desks.updateOneById(req.params.id, req.body);
    if (!checkDocExists(doc, res)) return;

    await DB.save();
    res.status(200).json({
        status: 'success',
        data: {
            desk: doc
        }
    });
};

const deleteDesk = async (req, res) => {
    const doc = Desks.deleteOneById(req.params.id);
    if (!checkDocExists(doc, res)) return;

    await DB.save();
    res.status(204).json({
        status: 'success',
        data: {
            desk: doc
        }
    });
};

export default {
    getAllDesks,
    getDesk,
    createDesk,
    updateDesk,
    deleteDesk
}