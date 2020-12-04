import axios from 'axios';
import config from '../config';

const photoUrl = 'https://maps.googleapis.com/maps/api/place/photo?key=' + config.GOOGLE_PLACES_API_KEY + '&maxwidth=400&photoreference=';
const placeDetailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json?fields=name,formatted_address,geometry&key=' + config.GOOGLE_PLACES_API_KEY + '&placeid=';
const autocompleteUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?fields=id,description,place_id,reference&key=' + config.GOOGLE_PLACES_API_KEY + '&input=';
const defaultUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=1000&key=' + config.GOOGLE_PLACES_API_KEY + '&location=';
//-33.8670522,151.1957362

const UUID = (function () {
    var self = {};
    var lut = [];
    for (var i = 0; i < 256; i++) { lut[i] = (i < 16 ? '0' : '') + (i).toString(16); }
    self.generate = function () {
        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
            lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
            lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
            lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    }
    return self;
})();


export const locationAutocomplete = async (search) => {
    const sessionToken = encodeURIComponent(UUID.generate());
    let predictions;
    try {
        const response = await axios.get(autocompleteUrl + encodeURIComponent(search) + `&sessiontoken=${sessionToken}`);
        predictions = response.data.predictions;
    } catch (err) {
        throw new Error(err.response.data.error_message);
    }
    return await processPredictions(predictions, sessionToken);
};

export const locationDefault = async (search) => {
    let { data: { results } } = await axios.get(defaultUrl + encodeURIComponent(search));

    return results;
};

export const processPredictions = async (predictions, sessionToken) => {
    return await Promise.all(predictions.map(async prediction => {

        // TODO: fast reached requests quota.
        const { data: { result: place } } = await axios.get(placeDetailsUrl + prediction.place_id + `&sessiontoken=${sessionToken}`);

        /*
        if(!place.photos) {
            place.photos = [];
        }

        place.photos = place.photos.map(function( photo ) {
            return {
                reference: photo.photo_reference,
                url: photoUrl + photo.photo_reference
            };
        });
        */
        prediction.place = place ? place.geometry.location : {};

        // prediction.place = {};

        delete prediction.terms;
        delete prediction.types;
        delete prediction.matched_substrings;
        delete prediction.structured_formatting;

        return prediction;
    }));
};

export const getPlace = async (placeId) => {
    const { data: { result: place } } = await axios.get(placeDetailsUrl + placeId);

    return place;
};

export const getPhotoUrl = function () {
    return photoUrl;
};