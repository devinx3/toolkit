import React from "react";
import ScriptManage from "./script"
import CombinationManage from "./combination"


const ManageBlock = ({ lang, context, buttons = {}, expandScriptButton = {}, expandCombinationButton = {}, editorHelpRender }) => {
    const [refresh, setRefresh] = React.useState(false);

    return <>
        <ScriptManage lang={lang} context={context} basicButtons={buttons}
            expandAddButton={expandScriptButton} editorHelpRender={editorHelpRender} refreshManage={() => setRefresh(!refresh)} />
        <CombinationManage lang={lang} context={context} basicButtons={buttons} expandAddButton={expandCombinationButton} />
    </>
}

export default ManageBlock