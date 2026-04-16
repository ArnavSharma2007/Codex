const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
  type: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const noteSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blocks: { type: [BlockSchema], default: [] },
  quillDelta: { type: mongoose.Schema.Types.Mixed, default: null },
  isPrivate: { type: Boolean, default: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
