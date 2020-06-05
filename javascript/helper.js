// Helper functions for data manipulation.

/** 
 *   data: list of data entries
 *   email: email of user
 *   returns list of all data entries for a person
 */
function getPersonData(data, email) {
    return data.filter(d => {
        return d.Email == email
    });
}

/** 
 *   personData: list of data entries
 *   activity: activity to filter by
 *   returns list of personData entries by activity
 */
function getPersonDataByActivity(personData, activity) {
    return personData.filter(d => d.Activity.substring(0, 2) == activity);
}

/** 
 *   str: column name in excel, ie Activity, Reason, Feeling
 *   data: list of data entries 
 *   index: used for split (ie. "b5" or "Intellectual")
 *   returns sorted map of keys to frequency, ie ("b5: 24")
 */
function getFrequencyByKey(str, data, index = 0) {
    let map = new Map();
    for (var i = 0; i < data.length; i++) {
        let key = data[i][str].split(":")[index];
        if (!map.has(key)) {
            map.set(key, 1);
        } else {
            map.set(key, map.get(key) + 1);
        }
    }

    let sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
    return sortedMap;
}

/** 
 *   data: list of data entries
 *   returns sorted map divided first by str1 then by str2
 */
function getFrequencyByKeys(str1, str2, data) {
    let map = {};
    for (var i = 0; i < data.length; i++) {
        let key = data[i][str1].split(":")[0];
        let key2 = data[i][str2];
        if (!(key in map)) {
            map[key] = {};
            map[key][key2] = 1
        } else {
            map[key][key2] = !(key2 in map[key]) ? 1 : (map[key][key2] + 1);
        }
    }

    // var sortedMap = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
    return map;
}

/** 
 *   data: list of data entries
 *   returns sorted map divided first by str1 then by str2, then by str3
 */
function getFrequencyByThreeKeys(str1, str2, str3, keyList, data) {
    let map = {};
    for (var i = 0; i < data.length; i++) {

        let key = data[i][str1].split(":")[0];
        if (keyList.indexOf(key) != -1) {
            let key2 = data[i][str2];
            let key3 = data[i][str3];
            if (!(key in map)) {
                map[key] = {};
                map[key][key2] = {};
                map[key][key2][key3] = 1;
            } else if (!(key2 in map[key])) {
                map[key][key2] = {};
                map[key][key2][key3] = 1;
            } else if (!(key3 in map[key][key2])) {
                map[key][key2][key3] = 1;
            } else {
                map[key][key2][key3] = map[key][key2][key3] + 1;
            }
        }
    }

    return map;
}

function createMapFromPersonality(data, key) {
    let finalMap = {};

    for (var i = 0; i < data.length; i++) {
        let email = data[i]["Email"];
        let value = data[i][key];

        finalMap[email] = value;
    }

    return finalMap;
}

function getFrequencyFromPersonalityMap(personData, personalityMap, key, index = 0) {
    let map = {};

    for (var i = 0; i < personData.length; i++) {
        let email = personData[i]["Email"];
        if (email in personalityMap) {
            let key1 = personalityMap[email];
            let key2 = personData[i][key].split(":")[index];

            if (!(key1 in map)) {
                map[key1] = {};
                map[key1][key2] = 1
            } else {
                map[key1][key2] = !(key2 in map[key1]) ? 1 : (map[key1][key2] + 1);
            }
        }
    }

    return map;
}

/**
 *   keyList: list of keys, usually top 5/6 keys
 *   map: map of (all) keys to list of frequencies, ie "b5: {"Good": 3, "Ok": 5}"
 *   returns map of keys in keyList to mode of second breakdown, ie "b5: Ok"
 */
function findMode(keyList, map) {
    let finalMap = {};

    keyList.forEach(function(id) {
        var keys = Object.keys(map[id]);
        var maxKey = "";
        var maxValue = 0;

        keys.forEach(function(reason) {
            if (map[id][reason] > maxValue) {
                maxKey = reason;
                maxValue = map[id][reason]
            }
        });

        finalMap[id] = maxKey;
    });

    return finalMap;
}

/**
 *   keyList: list of keys, usually top 5/6 keys
 *   map: map of (all) keys to list of frequencies, ie "b5: {"Good": 3, "Ok": 5}"
 *   returns map of keys in keyList to average moodLegend, starts at 0
 */
function findAvgMood(keyList, map, isRounded = true) {
    let finalMap = {};
    let overallMax = 0;
    let overallMin = 1000000;

    keyList.forEach(function(id) {
        let keys = Object.keys(map[id]);
        let value = 0;
        let count = 0;

        keys.forEach(function(mood) {
            value = value + map[id][mood] * (moodList.indexOf(mood));
            count = count + map[id][mood];
        });

        if (value / count > overallMax) {
            overallMax = value / count;
        }
        if (value / count < overallMin) {
            overallMin = value / count;
        }

        finalMap[id] = isRounded ? Math.round(value / count) : value / count;
    });

    return finalMap;
}

/**
 *   keyList: list of keys, usually top 5/6 keys
 *   map: map of (all) keys to list of frequencies, ie "b5: {"Good": 3, "Ok": 5}"
 *   avgMap: map of keys to averages, ie "b5: 2.722"
 *   returns map of keys in keyList to average moodLegend, starts at 0
 */
function findStdDevMood(keyList, map, avgMap) {
    let finalMap = {};

    keyList.forEach(function(id) {
        let keys = Object.keys(map[id]);
        let value = 0;
        let count = 0;

        keys.forEach(function(mood) {
            value = value + map[id][mood] * Math.pow(moodList.indexOf(mood) - avgMap[id], 2);
            count = count + map[id][mood];
        });

        finalMap[id] = Math.sqrt(value / count);
    });

    return finalMap;
}

function getTotalFrequencyFromMap(data) {
    let keys = Object.keys(data);
    let count = 0;

    keys.forEach(function(key) {
        count += data[key];
    });

    return count;
}