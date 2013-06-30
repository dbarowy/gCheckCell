function AnalysisData(/*XApplication*/ app) {
    "use strict";
    this.worksheets = app.getWorksheets();
    //this.charts=app.getCharts();
    this.nodelist = [];//holds all the TreeNodes in the Excel file.
    this.input_ranges = [];//holds all the input ranges of TreeNodes in the Excel file.
    this.starting_outputs = [];//holds all the values of all the output odes at the start of the procedure for swapping values
    this.output_cells = [];   //holds the output nodes at the start of the fuzzing procedure
    this.cell_nodes = new HashMap();
    this.input_cells_in_computation_count = 0;
    this.raw_input_cells_in_computation_count = 0;
    this.formula_cells_count = 0;
    this.formula_nodes = new HashMap();
    this.cell_nodes = new HashMap();
}