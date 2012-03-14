describe("chorus.dialogs.CreateExternalTableFromHdfs", function() {
    beforeEach(function() {
        setLoggedInUser({id: '54321'});
        chorus.page = {};
        this.sandbox = fixtures.sandbox({
            schemaName: "mySchema",
            databaseName: "myDatabase",
            instanceName: "myInstance"
        })
        chorus.page.workspace = fixtures.workspace();
        this.csv = new chorus.models.CsvHdfs({lines: [
            "COL1,col2, col3 ,col 4,Col_5",
            "val1.1,val1.2,val1.3,val1.4,val1.5",
            "val2.1,val2.2,val2.3,val2.4,val2.5",
            "val3.1,val3.2,val3.3,val3.4,val3.5"
        ],
            instanceId: "234",
            path: "/foo/bar.txt",
            toTable: "bar_txt"
        });
        this.dialog = new chorus.dialogs.CreateExternalTableFromHdfs({csv: this.csv});
        this.dialog.render();
    });

    it("fetches the list of workspaces for the logged in user", function() {
        var workspaces = new chorus.collections.WorkspaceSet([], {userId: "54321"});
        expect(workspaces).toHaveBeenFetched();
    })

    context("when the workspace fetch completes and there are no workspaces", function() {
        beforeEach(function() {
            this.server.completeFetchAllFor(new chorus.collections.WorkspaceSet([], {userId: "54321"}));
        });

        it("populates the dialog's errors div", function() {
            expect(this.dialog.$(".errors")).toContainTranslation("hdfs.create_external.no_workspaces");
        })
    })

    context("when the workspace fetch completes and there are workspaces", function() {
        beforeEach(function() {
            spyOn(chorus, "styleSelect")
            this.workspace1 = fixtures.workspace();
            this.workspace2 = fixtures.workspace();
            this.workspace2.unset("sandboxInfo");
            this.workspace3 = fixtures.workspace();
            this.server.completeFetchAllFor(new chorus.collections.WorkspaceSet([], {userId: "54321"}), [this.workspace1, this.workspace2, this.workspace3]);
        });

        it("has a select with the workspaces containing sandboxes as options", function() {
            expect(this.dialog.$(".directions option").length).toBe(2);
            expect(this.dialog.$(".directions option").eq(0).text()).toBe(this.workspace1.get("name"));
            expect(this.dialog.$(".directions option").eq(1).text()).toBe(this.workspace3.get("name"));

            expect(this.dialog.$(".directions option").eq(0).val()).toBe(this.workspace1.id);
            expect(this.dialog.$(".directions option").eq(1).val()).toBe(this.workspace3.id);
        })

        it("styles the select", function() {
            expect(chorus.styleSelect).toHaveBeenCalled();
        })

        it("has the right labels", function() {
            expect(this.dialog.title).toMatchTranslation("hdfs.create_external.title");
            expect(this.dialog.$("button.submit").text()).toMatchTranslation("hdfs.create_external.ok");
        })

        context("clicking submit", function() {
            context("with has header false", function() {
                beforeEach(function() {
                    this.dialog.$("#hasHeader").prop('checked', false).change();
                    this.dialog.$("select").val(this.workspace3.id);
                    this.dialog.$('button.submit').click();
                });

                it("posts to the right URL", function() {
                    var workspaceId = this.workspace3.id;
                    var request = this.server.lastCreate();
                    var statement = "bar_txt (column_1 text, column_2 text, column_3 text, column_4 text, column_5 text)";

                    expect(request.url).toMatchUrl("/edc/workspace/" + workspaceId + "/externaltable");
                    expect(request.params().statement).toBe(statement);
                    expect(request.params().hasHeader).toBe('false');
                });
            });
            context("with has header true", function() {
                beforeEach(function() {
                    this.dialog.$("select").val(this.workspace3.id);
                    this.dialog.$('button.submit').click();
                });

                it("starts the loading spinner", function() {
                    expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                    expect(this.dialog.$("button.submit")).toContainTranslation("hdfs.create_external.creating")
                });

                it("posts to the right URL", function() {
                    var workspaceId = this.workspace3.id;
                    var request = this.server.lastCreate();
                    var statement = "bar_txt (col1 text, col2 text, col3 text, col_4 text, col_5 text)";

                    expect(request.url).toMatchUrl("/edc/workspace/" + workspaceId + "/externaltable");
                    expect(request.params().path).toBe("/foo/bar.txt");
                    expect(request.params().instanceId).toBe("234");
                    expect(request.params().statement).toBe(statement);
                    expect(request.params().hasHeader).toBe('true');
                });

                context("when the post to import responds with success", function() {
                    beforeEach(function() {
                        spyOn(this.dialog, "closeModal");
                        spyOn(chorus, 'toast');
                        spyOn(chorus.PageEvents, 'broadcast');
                        this.server.lastCreate().succeed();
                    });

                    it("closes the dialog and displays the right toast", function() {
                        expect(this.dialog.closeModal).toHaveBeenCalled();
                        expect(chorus.toast).toHaveBeenCalledWith("hdfs.create_external.success", {workspaceName: this.workspace3.get("name"), tableName: this.dialog.$("input:text").eq(0).val()});
                    });

                    it("triggers csv_import:started", function() {
                        expect(chorus.PageEvents.broadcast).toHaveBeenCalledWith("csv_import:started");
                    });
                })
            });
        })
    })
});