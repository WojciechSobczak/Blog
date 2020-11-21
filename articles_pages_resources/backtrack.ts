namespace Backtracking {
    export class PathCell {
        public htmlCell: HTMLTableDataCellElement = null;
        public obstacle: boolean = false;
        public distance: number = null;
        public row: number = 0;
        public column: number = 0;
    
        constructor(htmlCell: HTMLTableDataCellElement, column: number, row: number) {
            this.htmlCell = htmlCell;
            this.column = column;
            this.row = row;
        }
    
        public isVisited(): boolean {
            return this.distance != null;
        }
    
        public isObstacle(): boolean {
            return this.obstacle;
        }
    
        public isOnPoint(point: Point) {
            return this.column === point.x && this.row === point.y;
        }
    
    }

    export class PointSet {
        private values: Array<Point> = [];


        public add(point: Point): void {
            for (let i = 0; i < this.values.length; i++) {
                if (this.values[i].equals(point)) {
                    return;
                }
            }
            this.values.push(point);
        }

        public remove(point: Point): void {
            for (let i = 0; i < this.values.length; i++) {
                if (this.values[i].equals(point)) {
                    this.values.splice(i, 1);
                    return;
                }
            }
        }

        public forEach(func: (point: Point) => void): void {
            this.values.forEach((point) => {
                func(point);
            })
        }

        public size(): number {
            return this.values.length;
        }
    }
    
    export class Cells2DArray {
        private cells: Array<Array<PathCell>> = [];
    
        constructor(cells: Array<Array<PathCell>>) {
            this.cells = cells;
        }
    
        public getRowsCount() {
            return this.cells.length;
        }
    
        public getColumsCount() {
            if (this.cells.length > 0) {
                return this.cells[0].length;
            }
            return 0;
        }
    
        public get(x: number, y: number): PathCell {
            return this.cells[y][x];
        }
    }

    export class Point {
        public x: number;
        public y: number;
    
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    
        public equals(point: Point) {
            return point != null && this.x === point.x && this.y === point.y;
        }
    }
    
    export class CheckOffset {
        public xOffset: number;
        public yOffset: number;
    
        constructor(xOffset: number, yOffset: number) {
            this.xOffset = xOffset;
            this.yOffset = yOffset;
        }
    }

    export enum GUIEditorClickAction {
        NONE, START_SET, FINISH_SET, OBSTACLE_SET, UNSET
    }

    export enum LookupStrategy {
        ALL_AROUND, CROSS
    }
    
    export class GUIState {
        public rows: number = 2;
        public columns: number = 2;
        public randomObstaclesCount: number = 0;
        public fixedSizeOpt: number = null;
        public clickAction: GUIEditorClickAction = GUIEditorClickAction.NONE;
        public cellsArray: Cells2DArray = new Cells2DArray([]);
        public lookupStrategy: LookupStrategy = LookupStrategy.ALL_AROUND;

        public startPointOpt: Point = null;
        public finishPointOpt: Point = null;
        public obstaclesSet: PointSet = new PointSet();
    }
    
    
    export class GUIHandler {
    
        public static PARENT_DIV_CLASS_NAME = '__pthfind_prnt_div_style';
        public static TABLE_CLASS_NAME = '__pthfind_table_style';
        public static TR_CLASS_NAME = '__pthfind_row_style';
        public static TD_CLASS_NAME = '__pthfind_cell_style';
    
    
        public static ROWS_INPUT_ID = '__pthfind_row_input_id';
        public static COLUMNS_INPUT_ID = '__pthfind_cols_input_id';
        public static OBSTACLES_INPUT_ID = '__pthfind_obstacles_input_id';
        public static SIZE_SLIDER_ID = '__pthfind_size_slider_id';
        public static START_BUTTON_ID = '__pthfind_start_button_id';
        public static CLICK_ACTION_SELECT_ID = '__pthfind_click_action_select_id';
        public static LOOKUP_STRATEGY_SELECT_ID = '__pthfind_click_lookup_strategy_id';
    
        public static MIN_ROW_VALUE = 2;
        public static MIN_COLUMNS_VALUE = 2;
        public static MIN_OBSTACLES_VALUE = 0;
        public static MIN_SLIDER_SIZE_VALUE = 10;
        public static MAX_SLIDER_SIZE_VALUE = 200;
    
        public static CURRENT_STATE = new GUIState();


        public static getState() {
            return this.CURRENT_STATE;
        }

        public static getStateCells() {
            return this.getState().cellsArray;
        }
    
        private static generateParentStyle() {
            return `
                .${GUIHandler.PARENT_DIV_CLASS_NAME} {
                    height: 100%;
                }
            `;
        };
    
        private static generateTableStyle(parentSizePx: number) {
            let height = parentSizePx / this.CURRENT_STATE.rows;
            let width = parentSizePx / this.CURRENT_STATE.columns;
            if (this.CURRENT_STATE.fixedSizeOpt != null) {
                height = this.CURRENT_STATE.fixedSizeOpt;
                width = this.CURRENT_STATE.fixedSizeOpt;
            }
    
            let size = Math.min(width, height);
    
            return `
                .${GUIHandler.PARENT_DIV_CLASS_NAME} {
                    height: 100%;
                }
                .${GUIHandler.TABLE_CLASS_NAME} {
                    margin-left: auto;
                    margin-right: auto;
                }
                .${GUIHandler.TR_CLASS_NAME} {
                }
                .${GUIHandler.TD_CLASS_NAME} {
                    text-align: center;
                    width: ${size}px;
                    height: ${size}px;
                    max-width: ${size}px;
                    max-height: ${size}px;
                    min-width: ${size}px;
                    min-height: ${size}px;
                    font-family: "Courier New", Courier, monospace;
                    font-weight: bold;
                    color: black;
                    word-wrap: normal;
                    overflow: hidden;
                    border-radius: 3px;
                    box-shadow: inset 0 0 8px #000000;
                }
            `;
        }
    
        public static createInputsMenu(destElem: HTMLDivElement) {
            destElem.classList.add("article-interactive-panel");
            let div = document.createElement("div");
            div.innerHTML = `
                <div>
                    <h2> Backtrack example </h2>
                    <label>
                        Columns:
                        <input class="article-interactive-input" 
                            id="${this.COLUMNS_INPUT_ID}" 
                            type="number" min="${this.MIN_COLUMNS_VALUE}"
                            value="${this.CURRENT_STATE.rows}">
                        </input>
                    </label>
                    <label>
                        Rows:
                        <input class="article-interactive-input" 
                            id="${this.ROWS_INPUT_ID}" 
                            type="number" 
                            min="${this.MIN_ROW_VALUE}" 
                            value="${this.CURRENT_STATE.columns}">
                        </input>
                    </label>
                    <label>
                        Obstacles:
                        <input class="article-interactive-input" 
                            id="${this.OBSTACLES_INPUT_ID}" 
                            type="number" 
                            min="${this.MIN_OBSTACLES_VALUE}" 
                            value="${this.CURRENT_STATE.randomObstaclesCount}">
                        </input>
                    </label>
                    <label>
                        Cell size:
                        <input class="article-interactive-input" 
                            id="${this.SIZE_SLIDER_ID}" 
                            type="range" 
                            min="${this.MIN_SLIDER_SIZE_VALUE}" 
                            max="${this.MAX_SLIDER_SIZE_VALUE}" 
                            value="${this.MAX_SLIDER_SIZE_VALUE}"
                        >
                        </input>
                    </label>
                    <label>
                        Click action:
                        <select id="${this.CLICK_ACTION_SELECT_ID}">
                            <option value="${GUIEditorClickAction.NONE}">-</option>
                            <option value="${GUIEditorClickAction.START_SET}">Set start</option>
                            <option value="${GUIEditorClickAction.FINISH_SET}">Set finish</option>
                            <option value="${GUIEditorClickAction.OBSTACLE_SET}">Set obstacle</option>
                            <option value="${GUIEditorClickAction.UNSET}">Remove properties</option>
                        </select>
                    </label>
                    <label>
                        Lookup strategy:
                        <select id="${this.LOOKUP_STRATEGY_SELECT_ID}">
                            <option value="${LookupStrategy.ALL_AROUND}">All around</option>
                            <option value="${LookupStrategy.CROSS}">Cross</option>
                        </select>
                    </label>
                    <label>
                        <button id="${this.START_BUTTON_ID}" class="btn">START</button>
                    </label>
                </div>
            `;
            destElem.appendChild(div);
        }
    
        public static getCreatedArray(destElem: HTMLDivElement): Cells2DArray {
            let output: Array<Array<PathCell>> = [];
            let htmlRows = destElem.getElementsByTagName("tr");
            for (let row = 0; row < htmlRows.length; row++) {
                let outputArray = new Array<PathCell>();
                let htmlRow = htmlRows[row];
                let cells = htmlRow.getElementsByTagName("td");
                for (let cell = 0; cell < cells.length; cell++) {
                    outputArray.push(new PathCell(cells[cell], cell, row));
                }
                output.push(outputArray);
            }
            return new Cells2DArray(output);
        }
    
        public static createArray(destElem: HTMLDivElement, rows: number, columns: number) {
            let htmlParentDiv = document.createElement("div");
            htmlParentDiv.setAttribute("class", this.PARENT_DIV_CLASS_NAME);
    
            let htmlStyle = document.createElement("style");
            htmlStyle.innerHTML = this.generateParentStyle();
            htmlParentDiv.appendChild(htmlStyle);
    
            let htmlTable = document.createElement("table");
            htmlTable.setAttribute("class", this.TABLE_CLASS_NAME);
    
            for (let row = 0; row < rows; row++) {
                let htmlRow = document.createElement("tr");
                htmlRow.setAttribute("class", this.TR_CLASS_NAME);
                let outputRow = new Array<PathCell>();
                for (let column = 0; column < columns; column++) {
                    let htmlCell = document.createElement("td");
                    htmlCell.setAttribute("class", this.TD_CLASS_NAME);
                    htmlRow.appendChild(htmlCell);
    
                    outputRow.push(new PathCell(htmlCell, column, row));
                }
                htmlTable.appendChild(htmlRow);
            }
            
            htmlParentDiv.appendChild(htmlTable);
            destElem.appendChild(htmlParentDiv);
    
            htmlStyle.innerHTML = htmlStyle.innerHTML + this.generateTableStyle(htmlParentDiv.getBoundingClientRect().width);
        }
    
        public static setupGUICallbacks(destElem: HTMLDivElement) {
            var _self = this;
            let rowsInput = document.getElementById(this.ROWS_INPUT_ID);
            rowsInput.onchange = function(ev: Event) {
                let input = ev.target as HTMLInputElement;
                let rows = parseInt(input.value);
                if (rows && rows >= _self.MIN_ROW_VALUE) {
                    _self.getState().rows = rows;
                    _self.recreateArrayFromState(destElem, true);
                }
            };
    
            let columnsInput = document.getElementById(this.COLUMNS_INPUT_ID);
            columnsInput.onchange = function(ev: Event) {
                let input = ev.target as HTMLInputElement;
                let columns = parseInt(input.value);
                if (columns && columns >= _self.MIN_COLUMNS_VALUE) {
                    _self.getState().columns = columns;
                    _self.recreateArrayFromState(destElem, true);
                }
            };
    
            let obstaclesInput = document.getElementById(this.OBSTACLES_INPUT_ID);
            obstaclesInput.onchange = function(ev: Event) {
                let input = ev.target as HTMLInputElement;
                let obstacles = parseInt(input.value);
                if (obstacles && obstacles >= _self.MIN_OBSTACLES_VALUE) {
                    _self.getState().randomObstaclesCount = obstacles;
                }
            };
    
            let startInput = document.getElementById(this.START_BUTTON_ID);
            startInput.onclick = function(ev) {
                _self.recreateArrayFromState(destElem, false);
                let presenter = new Presenter();
                presenter.startShow();
            };
    
            let sizeSlider = document.getElementById(this.SIZE_SLIDER_ID);
            sizeSlider.oninput = function(ev) {
                let input = ev.target as HTMLInputElement;
                let size = parseInt(input.value);
                if (size && size >= _self.MIN_SLIDER_SIZE_VALUE) {
                    _self.getState().fixedSizeOpt = size;
                    _self.recreateArrayFromState(destElem, false);
                }
            };

            let clickActionSelect = document.getElementById(this.CLICK_ACTION_SELECT_ID);
            clickActionSelect.onchange = function(ev) {
                let select = ev.target as HTMLSelectElement;
                let selectedIndex = select.selectedIndex;
                let selectedVal = parseInt(select.options[selectedIndex].value) as GUIEditorClickAction;
                _self.getState().clickAction = selectedVal;
            }

            let lookupStrategy = document.getElementById(this.LOOKUP_STRATEGY_SELECT_ID);
            lookupStrategy.onchange = function(ev) {
                let select = ev.target as HTMLSelectElement;
                let selectedIndex = select.selectedIndex;
                let selectedVal = parseInt(select.options[selectedIndex].value) as LookupStrategy;
                _self.getState().lookupStrategy = selectedVal;
            }

            let cellsArray = this.getStateCells();
            for (var row = 0; row < cellsArray.getRowsCount(); row++) {
                for (var column = 0; column < cellsArray.getColumsCount(); column++) {
                    cellsArray.get(column, row).htmlCell.onclick = function(ev) {
                        let cell = ev.target as HTMLTableDataCellElement;
                        let row = cell.parentElement as HTMLTableRowElement;
                        switch (_self.getState().clickAction) {
                            case GUIEditorClickAction.START_SET: {
                                _self.setStart(cell.cellIndex, row.rowIndex);
                                _self.drawStart(cell.cellIndex, row.rowIndex);
                                break;
                            }
                            case GUIEditorClickAction.FINISH_SET: {
                                _self.setDestination(cell.cellIndex, row.rowIndex);
                                _self.drawDestination(cell.cellIndex, row.rowIndex);
                                break;
                            }
                            case GUIEditorClickAction.OBSTACLE_SET: {
                                _self.setObstacle(cell.cellIndex, row.rowIndex);
                                _self.drawObstacle(cell.cellIndex, row.rowIndex);
                                break;
                            }
                            case GUIEditorClickAction.UNSET: {
                                _self.unsetAll(cell.cellIndex, row.rowIndex);
                                _self.undrawAll(cell.cellIndex, row.rowIndex);
                                break;
                            }
                        }
                    }
                }
            }
        }
    
        public static recreateArrayFromState(destElem: HTMLDivElement, removeCellsProps: boolean) {
            let parentDiv = destElem.getElementsByClassName(this.PARENT_DIV_CLASS_NAME)[0];
            parentDiv.parentElement.removeChild(parentDiv);
            this.createArray(destElem, this.CURRENT_STATE.rows, this.CURRENT_STATE.columns);
            this.CURRENT_STATE.cellsArray = this.getCreatedArray(destElem);

            if (removeCellsProps) {
                this.getState().startPointOpt = null;
                this.getState().finishPointOpt = null;
                this.getState().obstaclesSet = new PointSet();
            }

            let startPointOpt = this.getState().startPointOpt;
            let finishPointOpt = this.getState().finishPointOpt;
            if (startPointOpt != null) {
                this.drawStart(startPointOpt.x, startPointOpt.y);
            }
            if (finishPointOpt != null) {
                this.drawDestination(finishPointOpt.x, finishPointOpt.y);
            }
            let obstacles = this.getState().obstaclesSet;
            this.getState().obstaclesSet = new PointSet();
            obstacles.forEach((obstaclePoint) => {
                this.setObstacle(obstaclePoint.x, obstaclePoint.y);
                this.drawObstacle(obstaclePoint.x, obstaclePoint.y);
            })
            this.setupGUICallbacks(destElem);
        }
    
        public static createGUI(destElem: HTMLDivElement, rows: number, columns: number) {
            destElem.innerHTML = "";
            this.CURRENT_STATE.rows = rows;
            this.CURRENT_STATE.columns = columns;
    
            this.createInputsMenu(destElem);
            this.createArray(destElem, rows, columns);
            this.CURRENT_STATE.cellsArray = this.getCreatedArray(destElem);
            this.setupGUICallbacks(destElem);
        }
    
        public static setObstacle(column: number, row: number): void {
            this.unsetAll(column, row);
            let cell = this.getStateCells().get(column, row);
            cell.obstacle = true;
            this.getState().obstaclesSet.add(new Point(column, row));
        }

        public static drawObstacle(column: number, row: number): void {
            let cell = this.getStateCells().get(column, row);
            cell.htmlCell.setAttribute("style", "background-color: grey;");
        }
    
        public static setDistance(column: number, row: number, distance: number): void {
            let cell = this.getStateCells().get(column, row);
            cell.distance = distance;
        }

        public static drawDistance(column: number, row: number, distance: number): void {
            let cell = this.getStateCells().get(column, row);
            cell.htmlCell.textContent = distance.toFixed();
        }
    
        public static drawPath(column: number, row: number): void {
            let cell = this.getStateCells().get(column, row);
            cell.htmlCell.setAttribute("style", "background-color: lightgreen;");
        }
    
        public static setStart(column: number, row: number): void {
            let startPointOpt = this.CURRENT_STATE.startPointOpt;
            if (startPointOpt != null) {
                this.unsetAll(startPointOpt.x, startPointOpt.y);
            }
            this.CURRENT_STATE.startPointOpt = new Point(column, row);
        }

        public static drawStart(column: number, row: number): void {
            let cell = this.getStateCells().get(column, row);
            cell.htmlCell.setAttribute("style", "background-color: lightskyblue;");
            cell.htmlCell.textContent = "START";
        }
    
        public static setDestination(column: number, row: number): void {
            let finishPointOpt = this.CURRENT_STATE.finishPointOpt;
            if (finishPointOpt != null) {
                this.unsetAll(finishPointOpt.x, finishPointOpt.y);
            }
            this.CURRENT_STATE.finishPointOpt = new Point(column, row);
        }

        public static drawDestination(column: number, row: number): void {
            let cell = this.getStateCells().get(column, row);
            cell.htmlCell.setAttribute("style", "background-color: lightcoral;");
            cell.htmlCell.textContent = "END";
        }

        public static unsetAll(column: number, row: number): void {
            let startPointOpt = this.getState().startPointOpt;
            if (startPointOpt != null && startPointOpt.x == column && startPointOpt.y == row) {
                this.getState().startPointOpt = null;
            }
            let finishPointOpt = this.getState().finishPointOpt;
            if (finishPointOpt != null && finishPointOpt.x == column && finishPointOpt.y == row) {
                this.getState().finishPointOpt = null;
            }
            this.getState().obstaclesSet.remove(new Point(column, row));

            let cell = this.getStateCells().get(column, row);
            cell.obstacle = false;
            cell.distance = null;
            cell.htmlCell.removeAttribute("style");
            cell.htmlCell.textContent = "";
        }

        public static undrawAll(column: number, row: number): void {
            let cell = this.getStateCells().get(column, row);
            cell.htmlCell.removeAttribute("style");
            cell.htmlCell.textContent = "";
        }
    
    }
    
    
    export class Presenter {
    
        private start: Point = null;
        public setStart(start: Point) {
            this.start = start;
        }
        private finish: Point = null;
        public setFinish(finish: Point) {
            this.finish = finish;
        }

        private static readonly CHECK_AROUND_OFFSETS = new Array<CheckOffset>(
            new CheckOffset(0, -1), //north
            new CheckOffset(1, -1), //north-east
            new CheckOffset(1, 0), //east
            new CheckOffset(1, 1), //south-east
            new CheckOffset(0, 1), //south
            new CheckOffset(-1, 1), //south-west
            new CheckOffset(-1, 0), // west
            new CheckOffset(-1, -1) // north-west
        );
    
        private static readonly CHECK_CROSS_OFFSETS = new Array<CheckOffset>(
            new CheckOffset(0, -1), //north
            new CheckOffset(1, 0), //east
            new CheckOffset(0, 1), //south
            new CheckOffset(-1, 0), // west
        );
    
    
        private rand(from, to) {
            return Math.floor(Math.random() * to) + from; 
        }
    
        private setObstacle(x: number, y: number) {
            GUIHandler.setObstacle(x, y);
            GUIHandler.drawObstacle(x, y);
        }
    
        private setVisibleDistance(x: number, y: number, distance: number) {
            GUIHandler.setDistance(x, y, distance);
            GUIHandler.drawDistance(x, y, distance);
        }
    
        private setNotVisibleDistance(x: number, y: number, distance: number) {
            GUIHandler.setDistance(x, y, distance);
        }
    
        public generateObstaclesIfSet() {
            const guiState = GUIHandler.getState();
            if (guiState.obstaclesSet.size() != 0 || guiState.randomObstaclesCount == 0) {
                return;
            }

            let obstacles = guiState.randomObstaclesCount;
            const rows = GUIHandler.getStateCells().getRowsCount();
            const columns = GUIHandler.getStateCells().getColumsCount();
    
            let maxCellsWithoutEnds = columns * rows - 2;
            if (obstacles >= maxCellsWithoutEnds) {
                obstacles = maxCellsWithoutEnds;
            }
    
            for (let i = 0; i < obstacles;) {
                let x = this.rand(0, columns);
                let y = this.rand(0, rows);
                if (!GUIHandler.getStateCells().get(x, y).obstacle) {
                    this.setObstacle(x, y);
                    i++;
                }
            }
        }
    
        public getRandomNonObstaclePoint() {
            const rows = GUIHandler.getStateCells().getRowsCount();
            const columns = GUIHandler.getStateCells().getColumsCount();
            while (true) {
                let x = this.rand(0, columns);
                let y = this.rand(0, rows);
                if (GUIHandler.getStateCells().get(x, y).obstacle == false) {
                    return new Point(x, y);
                }
            };
        }
    
        public setStartPoint() {
            if (GUIHandler.getState().startPointOpt != null) {
                this.start = GUIHandler.getState().startPointOpt;
                return;
            }
            do {
                this.start = this.getRandomNonObstaclePoint();
            } while (this.start.equals(this.finish));
            GUIHandler.setStart(this.start.x, this.start.y);
            GUIHandler.drawStart(this.start.x, this.start.y);
        }
    
        public setFinishPoint() {
            if (GUIHandler.getState().finishPointOpt != null) {
                this.finish = GUIHandler.getState().finishPointOpt;
                return;
            }
            do {
                this.finish = this.getRandomNonObstaclePoint();
            } while (this.finish.equals(this.start))
            GUIHandler.setDestination(this.finish.x, this.finish.y);
            GUIHandler.drawDestination(this.finish.x, this.finish.y);
        }
    
        private existsInArray(x: number, y: number): boolean {
            return x >= 0 && y >= 0 && x < GUIHandler.getStateCells().getColumsCount() && y < GUIHandler.getStateCells().getRowsCount();
        }
    
        private forOffsetedPoints(currentCell: PathCell, callback: (checkedCell: PathCell) => boolean, offsetsArray: Array<CheckOffset>): void {
            offsetsArray.forEach((offset) => {
                let checkedX = currentCell.column + offset.xOffset;
                let checkedY = currentCell.row + offset.yOffset;
                if (this.existsInArray(checkedX, checkedY)) {
                    let checkedCell = GUIHandler.getStateCells().get(checkedX, checkedY);
                    return callback(checkedCell);
                }
            });
        }
    
        private forPointsAround(currentCell: PathCell, callback: (checkedCell: PathCell) => boolean): void {
            this.forOffsetedPoints(currentCell, callback, Presenter.CHECK_AROUND_OFFSETS);
        }
    
        private forPointsCross(currentCell: PathCell, callback: (checkedCell: PathCell) => boolean): void {
            this.forOffsetedPoints(currentCell, callback, Presenter.CHECK_CROSS_OFFSETS);
        }
    
        public startShow() {
            this.generateObstaclesIfSet();
            this.setStartPoint();
            this.setFinishPoint();
            this.setNotVisibleDistance(this.start.x, this.start.y, 0);

            let cells = GUIHandler.getStateCells();

            let pointsLookupFunc = (currentCell, callback: (checkedCell: PathCell) => boolean) => {
                this.forPointsAround(currentCell, callback);
            };
            if (GUIHandler.getState().lookupStrategy === LookupStrategy.CROSS) {
                pointsLookupFunc = (currentCell, callback: (checkedCell: PathCell) => boolean) => {
                    this.forPointsCross(currentCell, callback);
                };
            }
    
            //Mapping points to their distance
            let finishFound = false;
            let pointToVisit: Array<Point> = [this.start];
            while (pointToVisit.length != 0) {
                let currentPoint = pointToVisit[0];
                pointToVisit.splice(0, 1);
                let currentCell = cells.get(currentPoint.x, currentPoint.y);
    
                pointsLookupFunc(currentCell, (checkedCell: PathCell) => {
                    if (checkedCell.isOnPoint(this.finish)) {
                        finishFound = true;
                        this.setNotVisibleDistance(checkedCell.column, checkedCell.row, currentCell.distance + 1);
                        return true;
                    }
                    if (!checkedCell.isObstacle() && !checkedCell.isVisited()) {
                        this.setVisibleDistance(checkedCell.column, checkedCell.row, currentCell.distance + 1);
                        pointToVisit.push(new Point(checkedCell.column, checkedCell.row));
                    }
                });
                if (finishFound) {
                    break;
                }
            }
    
            if (finishFound) {
                //Actual backtracking
                let currentCell = cells.get(this.finish.x, this.finish.y);
                let startFound = false;
                while (startFound == false) {
                    pointsLookupFunc(currentCell, (checkedCell: PathCell) => {
                        if (checkedCell.isOnPoint(this.start)) {
                            startFound = true;
                            return true;
                        }
                        if (checkedCell.isVisited() && checkedCell.distance == currentCell.distance - 1) {
                            GUIHandler.drawPath(checkedCell.column, checkedCell.row);
                            currentCell = checkedCell;
                            return true;
                        }
                    });
                }
            }
        }
    }
}


