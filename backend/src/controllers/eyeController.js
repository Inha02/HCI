const Eye = require('../models/Eye');

exports.saveEyeData = async (req, res) => {
  try {
    const data = new Eye(req.body);
    await data.save();

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
