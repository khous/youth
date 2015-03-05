$.ready(function () {
/*
    series browser, Guide browser (DDL and cursors)
    flow, get library.json
    check for last Guide accessed in local storage
    else
    get current date, find the current Guide, or nearest Guide defaulting to the last Guide
*/
    //SHOW load mask
    //make the UI
    var self = this;

    function setGuide (index) {
        self.currentGuideIdx = index;
        renderReferenceAndGuide();
        //set correct buttons enabled and disabled
    }

    function nextGuide () {
        setGuide(self.currentGuideIdx + 1);
    }

    function previousGuide () {
        setGuide(index - 1);
    }

    function selectSeries () {
        var selectedSeriesIndex = self.ui.seriesBrowser.find("option:selected").data("index");
        self.currentSeries = self.library.series[selectedSeriesIndex];
        self.currentGuideIdx = 0;

        renderReferenceAndGuide();
    }

    function selectGuide () {
        var selectedGuideIndex = self.ui.guideBrowser.find("option:selected").data("index");
        self.currentGuideIdx = selectedGuideIndex;

        renderReferenceAndGuide();
    }

    function toggleGuideOrReference (e) {

    }

    //grab all the elements and assign them to me
    //hookup listeners
    //get the library resource file
    //load based on local storage
    //or load based on date
    function startupUI () {
        //Get reference to the UI
        self.ui = {
            seriesBrowser: $(".series-browser"),
            guideBrowser: $(".guide-browser"),
            previousButton: $("button.previous"),
            nextButton: $("button.next"),
            guideButton: $(".guide-reference-toggle button.guide"),
            referenceButton: $(".guide-reference-toggle button.reference"),
            guideNode: $(".guide-md"),
            referenceNode: $(".reference-md")
        };

        hookupEvents();

        getLibrary().success(function (response) {
            self.library = response;

            renderNavigationUI();

            loadCorrectGuide();
        });
    }

    function hookupEvents () {
        var ui = self.ui;

        ui.previousButton.on("click", previousGuide);
        ui.nextButton.on("click", nextGuide);

        ui.seriesBrowser.on("select", selectSeries);
        ui.guideBrowser.on("select", selectGuide);

        ui.guideButton.on("click", toggleGuideOrReference);
        ui.referenceButton.on("click", toggleGuideOrReference);
    }

    function getLibrary () {
        return $.get("/library.json");
    }

    //Called after most user actions
    function saveStateToLocalStorage () {

    }

    //Called when UI is built
    function setStateFromLocalStorage () {
        //set series, guide, reference or guide
    }

    function loadCorrectGuide () {
        //determine correct Guide based on either local storage or date
        var lastSeriesIndex = localStorage && localStorage.getItem("lastGuideViewed"),
            lastGuideIndex = localStorage && localStorage.getItem("lastGuideViewed");

        if (lastGuideIndex || lastGuideIndex === 0) {
            //recall that guide by index
            self.currentGuideIdx = lastGuideIndex;
            self.currentSeries = self.library.series[lastSeriesIndex];
        } else {//just set to first lesson right meow
            self.currentGuideIdx = 0;
            self.currentSeries = self.library.series[0];
        }

        renderGuide();
        renderReference();
    }

    function renderNavigationUI () {
        renderSeriesSelect();
        renderGuideSelect()
    }

    function renderSeriesSelect () {
        var seriesBrowser = self.ui.seriesBrowser,
            seriesNodes = [];

        self.library.series.forEach(function (series, i) {
            var node = $("<option>");
            node.html(series.title);
            node.data("index", i);
            seriesNodes.push(node);
        });

        seriesBrowser.append(seriesNodes);
    }

    function renderGuideSelect () {
        var guides = [],
            guideBrowser = self.ui.guideBrowser;
        self.currentSeries.guides.forEach(function (guide, i) {
            var node = $("<option>");

            node.html("Week " + i);
            node.data("index", i);

            guides.push(node);
        });

        guideBrowser.append(guides);
    }

    function renderReferenceAndGuide () {
        renderGuide();
        renderReference();
    }

    function renderGuide () {
        return renderMarkdown(self.ui.guidNode, composePath(getCurrentGuide().guide));
    }

    function composePath (path) {
        return self.currentSeries.rootPath + path;
    }

    function renderReference () {
        return renderMarkdown(self.ui.guidNode, composePath(getCurrentGuide().reference));
    }

    function renderMarkdown (node, pathToMarkdown) {
        return $.get(pathToMarkdown).success(function (md) {
            node.html(marked(md));
        });
    }

    function getCurrentGuide () {
        return self.currentSeries.guides[self.currentGuideIdx];
    }

    //Disable UI and show mask when loading
    function setLoading (loading) {

    }
});