const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }

    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    // console.log(this.images[0].url);
    const url = this.images[0].url.replace('w=400', 'w=200&h=200').replace('fit=max', 'fit=crop')
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <img src="${url}" class="img-thumbnail" alt="">
    <p>${this.description.substring(0, 20)}...</p>`
});

//https://images.unsplash.com/
// photo-1467358895199-cd5d1847a7e4?crop=entropy
// &cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NDQzNzl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODk1MzMzNzd8
// &ixlib=rb-4.0.3&q=80&w=400

// https://images.unsplash.com/photo-1478815716600-15f0c3eb8e4b?crop=entropy&cs=tinysrgb&fit
// =max&fm=jpg&ixid=M3w0NDQzNzl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODkzNDk3MDR8&ixlib=rb-4.0.3&q=80&w=100

CampgroundSchema.post('findOneAndRemove', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);