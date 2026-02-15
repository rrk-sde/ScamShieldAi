import mongoose from 'mongoose';

const DailyDigestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
    },
    date: {
        type: Date,
        required: [true, 'Please provide a date'],
        default: Date.now,
    },
    digestId: {
        type: String, // e.g., 'CD-808'
        required: true,
    },
    summary: {
        type: String,
        required: false,
    },
    downloadLink: {
        type: String, // URL to PDF (can be internal or external)
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.DailyDigest || mongoose.model('DailyDigest', DailyDigestSchema);
