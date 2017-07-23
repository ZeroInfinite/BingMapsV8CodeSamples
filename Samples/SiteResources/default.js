﻿var githubProjectUrl = 'https://github.com/Microsoft/BingMapsV8CodeSamples/blob/master/Samples/';
var currentSampleElm;

function loadSample(name, path, sourcePath) {
    var sampleNode = getSampleNode(name);

    if (sampleNode) {
        if (currentSampleElm) {
            currentSampleElm.classList.remove('selectedNode');
        }

        currentSampleElm = sampleNode;
        currentSampleElm.classList.add('selectedNode');
    }
    
    window.location.hash = encodeURIComponent(name);
    document.getElementById('displayWindow').src = path;

    if (sourcePath && sourcePath != '') {
        document.getElementById('sourceCodeLinkPanel').style.display = '';
        document.getElementById('newWindowLink').href = path;
        document.getElementById('sourceCodeLink').href = githubProjectUrl + sourcePath;
    } else {
        document.getElementById('sourceCodeLinkPanel').style.display = 'none';
    }
    document.getElementById('displayWindow').focus();
}

var spaceRx = /\s/g;

function getSampleNode(name) {
    name = decodeURIComponent(name);

    var sampleLinks = document.getElementById('SampleTreeView').getElementsByTagName('a');

    for (var i = 0; i < sampleLinks.length; i++) {
        if (sampleLinks[i].innerText === name) {
            return sampleLinks[i];
        }
    }

    return null;
}

function getSamplesParent(sampleElm) {
    return sampleElm.parentNode.parentNode.parentNode.parentNode.parentNode.id;
}

function loadSampleByHash(hash) {
    var redirect = sampleRedirects[hash];

    if (redirect) {
        hash = redirect;
    }

    var sampleNode = getSampleNode(hash);

    if (sampleNode) {
        currentSampleElm = sampleNode;
        currentSampleElm.classList.add('selectedNode');

        window.location = sampleNode.href;

        var childNodesArg = getSamplesParent(sampleNode);
        var parentId = childNodesArg.replace('Nodes', '');
        var nodeIndex = parentId.charAt(parentId.length - 1);

        if (/[0-9]+/.test(nodeIndex)) {
            TreeView_ToggleNode(SampleTreeView_Data, nodeIndex, document.getElementById(parentId), ' ', document.getElementById(childNodesArg));
        }
    }
}

window.onload = function () {
    if (WarningMessage) {
        alert(WarningMessage);
    }

    var hash = window.location.hash;

    if (hash) {
        hash = hash.replace('#', '');
        loadSampleByHash(hash);
    }
};

$(function () {
    $.widget("custom.catcomplete", $.ui.autocomplete, {
        _create: function () {
            this._super();
            this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
        },
        _renderMenu: function (ul, items) {
            var that = this,
              currentCategory = "";
            $.each(items, function (index, item) {
                var li;
                if (item.category != currentCategory) {
                    ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                    currentCategory = item.category;
                }
                li = that._renderItemData(ul, item);
                if (item.category) {
                    li.attr("aria-label", item.category + " : " + item.label);
                }
            });
        }
    });

    SampleList.sort(function (a, b) {
        var nameA = a.label.toLowerCase(), nameB = b.label.toLowerCase()
        if (nameA < nameB) //sort string ascending
            return -1
        if (nameA > nameB)
            return 1
        return 0 //default return value (no sorting)
    });

    $("#searchTbx").autocomplete({
        delay: 0,
        source: SampleList,
        delay: 0,
        select: function (event, ui) {
            if (ui && ui.item && ui.item.action) {
                ui.item.action();
            }
        }
    }).click(function () {
        $(this).val('');
    });

    $("#searchTbx").val('Search the samples');
});

var sampleRedirects = {
    'CustomOverlay_HtmlPushpinLayer': 'Html Pushpin Layer',
    'QueryAPI_Nearby': 'Find Nearby Search - Query API',
    'CustomOverlay_CanvasLayer': 'Canvas Layer',
    "Map_ContextMenu": "Context Menu",
    "Map_KeyEvents": "Map Key Events",
    "Map_LazyLoading": "Lazy Loading the Map",
    "GeoJson_LocalFile": "GeoJson Drag and Drop"
};