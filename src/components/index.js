import "./scss/main.scss";

import BoilerplateColor from "./color";
import BoilerplateFontSizePicker from "./fontsize-picker";
import BoilerplatePanelBody from "./panelbody";
import BoilerplateSpacingSizes from "./spacing-sizes";
import BoilerplateStyleTag from "./style-tag";
import BoilerplateToggleGroup from "./toggle-group";
import BoilerplateTab from "./tab";
import BoilerplateConditionalWrapper from "./conditional-wrapper";
import BoilerplateResponsive from "./responsive";
import BoilerplateRangeControl from "./range-control";
import BoilerplateTextareaControl from "./textarea-control";
import BoilerplateSelectControl from "./select-control";

if(window?.boilerplateBlocks?.screen) {
    window.boilerplateBlocks.components = {
        ...window?.wp?.components,
        BoilerplateColor,
        BoilerplateFontSizePicker,
        BoilerplatePanelBody,
        BoilerplateSpacingSizes,
        BoilerplateStyleTag,
        BoilerplateToggleGroup,
        BoilerplateTab,
        BoilerplateConditionalWrapper,
        BoilerplateResponsive,
        BoilerplateRangeControl,
        BoilerplateTextareaControl,
        BoilerplateSelectControl
    }
}