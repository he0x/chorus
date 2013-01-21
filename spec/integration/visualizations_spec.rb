require File.join(File.dirname(__FILE__), 'spec_helper')

#These tests actually create the charts from the instances view. Need to write separate tests for visulaization from sandbox

describe "Visualizations", :database_integration do
  let(:instance) { InstanceIntegration.real_gpdb_instance }
  let(:database) { InstanceIntegration.real_database }
  let(:schema) { database.schemas.find_by_name("test_schema") }
  let(:table) { schema.datasets.find_by_name("base_table1") }
  let(:configure_chart) {}

  before do
    login(users(:admin))
    visit("#/instances")
    find("a", :text => /^#{instance.name}$/).click
    find("a", :text => /^#{database.name}$/).click
    find("a", :text => /^#{schema.name}$/).click
    find("a", :text => /^#{table.name}$/).click
    find(".list li.selected").click
    click_button "Visualize"
  end

  shared_examples "a visualization" do
    it "should create a chart" do
      find(".chart_icon.#{chart_type}").click
      configure_chart
      click_button "Create Chart"

      within_modal do
        page.should have_content "Visualization: #{table.name}"
        click_link "Show Data Table"
        page.should have_content "Results Console"
        click_link "Hide Data Table"
        click_button "Save As..."
        find(:xpath, "//a[contains(., 'Desktop Image')]").click
        #find('a', :text => "Desktop Image").click
        # We would like to make an assertion about the content-type header or response code,
        # but Selenium does not support this. Add assertion if we move to different driver.
        click_button "Close"
      end
    end
  end

  describe "Create frequency plot" do
    let(:chart_type) { 'frequency' }

    it_behaves_like "a visualization"
  end

  describe "Create box plot" do
    let(:chart_type) { 'boxplot' }
    let(:configure_chart) do

      page.execute_script("$('.value.field select').val('column1')")
      page.execute_script("$('.value.field select').selectmenu('refresh')")
      page.execute_script("$('.value.field select').change()")

      page.execute_script("$('.category.field select').val('category')")
      page.execute_script("$('.category.field select').selectmenu('refresh')")
      page.execute_script("$('.category.field select').change()")
    end

    it_behaves_like "a visualization"
  end

  describe "Create time series plot" do
    let(:chart_type) { 'timeseries' }
    let(:configure_chart) do
      click_link "year"
      find(".ui-tooltip .limiter_menu.time").should be_visible
      page.execute_script("$('.ui-tooltip .limiter_menu.time li:eq(2)').click()")
    end

    it_behaves_like "a visualization"
  end

  describe "Create heat map plot" do
    let(:chart_type) { 'heatmap' }

    it_behaves_like "a visualization"
  end

  describe "Create histogram plot" do
    let(:chart_type) { 'histogram' }

    it_behaves_like "a visualization"
  end
end