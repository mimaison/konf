$(document).ready(function() {
    $("#search").on("keyup", function() {
        search();
    });
});


var tags = new Set();
var years = new Set();
const options = {
    includeScore: true,
    minMatchCharLength: 2,
    threshold: 0.0,
    useExtendedSearch: true,
    ignoreLocation: true,
    keys: [
        "title",
        "description",
        "year",
        "tags"
    ]
};
var fuse = null;

$.getJSON( "talks.json", function(talks) {
    fuse = new Fuse(talks, options);
    for (let i = 0; i < talks.length; i++) {
        let talk = talks[i];
        years.add(talk.year);
        for (let j = 0; j < talk.tags.length; j++) {
            let tag = talk.tags[j];
            tags.add(tag);
        }
    }
    $("#years").html(selectors(years));
    $("#tags").html(selectors(tags));
});

function selectors(items) {
    var out = "";
    items.forEach(item => {
        out += "<input type='checkbox' id='" + item + "' name='" + item + "' onchange='search()'><label for='" + item + "'>" + item + "</label>";
        $("input[name=" + item + "]").change(function() { search(); });
    });
    return out;
}

function formatResults(talks) {
    if (talks.length === 0) {
        return "";
    }
    var out = "<span>Found " + talks.length + " talks!</span>";
    out += "<ul>";
    for (let i = 0; i < talks.length; i++) {
        out += formatTalk(talks[i].item);
    }
    out += "</ul>";
    return out;
}

function formatTalk(talk) {
    return `<li class=\"talk\">
        <h3><a href="${talk.link}" target="_blank">${talk.title}</a></h3>
        <div>${talk.description}</div>
        <div><b>Event:</b> ${talk.event} - ${talk.year}</div>
        <div><b>Speakers:</b> ${formatSpeakers(talk.speakers)}</div>
        <div><b>Tags:</b> ${talk.tags.join(", ")}</div>
    </li>`;
}

function formatSpeakers(speakers) {
    var list = [];
    for (let i = 0; i < speakers.length; i++) {
        speaker = speakers[i];
        list.push(speaker.name + " - " + speaker.company);
    }
    return list.join(", ");
}

function search() {
    var conditions = [];
    let value = $("#search").val();
    if (value.length !== 0) {
        conditions.push({ $or: [ { title: value }, { description: value } ] });
    }

    let selectedYears = []
    $("#years>input").each(function() {
        if ($(this).is(':checked')) {
            selectedYears.push({ year: "'" + $(this).attr("id")})
        }
    });
    if (selectedYears.length !== 0) {
        conditions.push({ $or: selectedYears });
    }

    let selectedTags = []
    $("#tags>input").each(function() {
        if ($(this).is(':checked')) {
            selectedTags.push({ tags: "'" + $(this).attr("id")})
        }
    });
    if (selectedTags.length !== 0) {
        conditions.push({ $and: selectedTags });
    }
    
    let results = fuse.search({ $and: conditions });
    $("#results").html(formatResults(results));
}
