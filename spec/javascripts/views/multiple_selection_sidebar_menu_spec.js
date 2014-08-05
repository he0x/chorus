describe("chorus.views.MultipleSelectionSidebar", function() {
    var dialogConstructor = chorus.dialogs.ChangePassword;
    var method = 'enable';
    var actionName = 'add_data';
    var methodActionName = 'enable';

    beforeEach(function() {
        this.modalSpy = stubModals();
        this.selectEvent = "arbitrarily:anything";
        var actionProvider = function () {
            return [
                {name: actionName, target: dialogConstructor},
                {name: methodActionName, target: method}
            ];
        };

        this.view = new chorus.views.MultipleSelectionSidebarMenu({
            actionProvider: actionProvider,
            selectEvent: this.selectEvent
        });

        this.view.render();
        $('#jasmine_content').append(this.view.el);
    });

    context("when no models are selected", function() {
        it("shows no actions", function() {
            expect(this.view.$('.actions')).not.toBeVisible();
        });
    });

    describe("context-aware actions", function () {
        var actionProviderSpy;

        beforeEach(function () {
            this.collection = new chorus.collections.Base([new chorus.models.Base()]);
            actionProviderSpy = jasmine.createSpy('actionProvider');

            this.view = new chorus.views.MultipleSelectionSidebarMenu({
                actionProvider: actionProviderSpy,
                selectEvent: this.selectEvent
            });
        });

        it("pass the collection to the action provider for context", function () {
            expect(actionProviderSpy).not.toHaveBeenCalledWith(this.view.selectedModels);
            chorus.PageEvents.trigger(this.selectEvent, this.collection);
            expect(actionProviderSpy).toHaveBeenCalledWith(this.collection);
        });

    });

    context("when two models are selected", function() {
        beforeEach(function() {
            var twoModels = [new chorus.models.Base(), new chorus.models.Base()];
            this.collection = new chorus.collections.Base(twoModels);
            spyOn(this.collection, 'invoke');
        });

        it("is visible", function() {
            chorus.PageEvents.trigger(this.selectEvent, this.collection);
            expect(this.view.$el).toBeVisible();
        });

        it("shows the number of models selected", function() {
            chorus.PageEvents.trigger(this.selectEvent, this.collection);
            expect(this.view.$('.title')).toContainTranslation('sidebar.selected', {count: 2});
        });

        it("lists the model names under the selected text", function() {
            chorus.PageEvents.trigger(this.selectEvent, this.collection);
            var collection = new chorus.collections.Base([
                backboneFixtures.workfile.sql(),
                backboneFixtures.jdbcDataset(),
                backboneFixtures.oracleSchema()
            ]);
            chorus.PageEvents.trigger(this.selectEvent, collection);
            expect(this.view.$('.selected_models')).toContainText(Handlebars.helpers.modelNamesList(collection));
        });

        it("renders custom actions", function() {
            chorus.PageEvents.trigger(this.selectEvent, this.collection);
            expect(this.view.$("li")).toContainTranslation('actions.'+actionName);
        });

        describe("clicking a method action", function () {
            beforeEach(function () {
                chorus.PageEvents.trigger(this.selectEvent, this.collection);
            });

            it("invokes the method on the selectedModels", function () {
                expect(this.collection.invoke).not.toHaveBeenCalled();
                this.view.$("."+methodActionName).click();
                expect(this.collection.invoke).toHaveBeenCalledWith(method);
            });

            itBehavesLike.aDialogLauncher("."+actionName, dialogConstructor);
        });

        describe("clicking deselect all link", function() {
            beforeEach(function() {
                chorus.PageEvents.trigger(this.selectEvent, this.collection);
                spyOn(chorus.PageEvents, "trigger");
                this.view.$(".deselect_all").click();
            });

            it("triggers a selectNone event", function() {
                expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("selectNone");
            });
        });
    });
});
