import React from "react";
import ScriptManage from "./script"
import CombinationManage from "./combination"


const ManageBlock = ({ lang, category, context, intelligent, buttons = {}, expandScriptButton = {}, expandCombinationButton = {}, editorHelpRender, aiRender }) => {
    const [refresh, setRefresh] = React.useState(false);

    return <>
        <ScriptManage lang={lang} category={category} context={context} intelligent={intelligent} basicButtons={buttons}
            expandAddButton={expandScriptButton} editorHelpRender={editorHelpRender} aiRender={aiRender} refreshManage={() => setRefresh(!refresh)} />
        <CombinationManage lang={lang} category={category} context={context} intelligent={intelligent} basicButtons={buttons} expandAddButton={expandCombinationButton} />
    </>
}

export default ManageBlock