﻿<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="Samples.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Bing Maps V8 Code Samples</title>
	<meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="IE=Edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1"/>

    <link href="SiteResources/bingUrlIcon.png" rel="shortcut icon" />
    <link type="text/css" rel="stylesheet" href="SiteResources/default.css" />
    <link rel="stylesheet" href="https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/themes/base/jquery-ui.css"/>

    <script type="text/javascript">
        var WarningMessage = '<%=WarningMessage%>';
        var NumberOfSamples = <%=NumberOfSamples%>;
        var SampleList = <%=SampleList%>;
    </script>

    <style>
    body, html {
        padding: 0;
        margin:0;
        height: 100vh;
    }
    </style>
</head>
<body>  
     <div class="header">
        <img src="SiteResources/bingMapsLogo.png" />
        <span class="subTitle">V8 Code Samples</span>

        <span class="pageLinks">
            <a href="http://blogs.bing.com/maps" target="_blank">Blog</a>
            <a href="https://social.msdn.microsoft.com/Forums/en-US/home?category=bingmaps" target="_blank">Forums</a>
            <a href="https://msdn.microsoft.com/en-us/library/mt712542.aspx" target="_blank">Documentation</a>
            <a href="http://www.bing.com/api/maps/sdkrelease/mapcontrol/isdk" target="_blank">Interactive SDK</a>
            <a href="https://github.com/Microsoft/BingMapsV8CodeSamples" target="_blank">GitHub Project</a>
        </span>
    </div>

    <div class="content">
        <div id="sampleTreeContainer">
            <input id="searchTbx"/>

            <form id="form1" runat="server">
                <asp:TreeView ID="SampleTreeView" ExpandDepth="0" 
                    HoverNodeStyle-CssClass="sampleListHover"
                    EnableClientScript="true" runat="server">
                    <LevelStyles>
                        <asp:TreeNodeStyle CssClass="categoryNode"/>
                        <asp:TreeNodeStyle CssClass="sampleNode"/>
                    </LevelStyles>
                </asp:TreeView>
            </form>
        </div>

        <iframe id="displayWindow" src="Welcome.html" allowfullscreen></iframe>

        <div id="sourceCodeLinkPanel" style="display:none;">
            <a id="newWindowLink" class="blueAnchorButton" href="http://bing.com" target="_blank">Open in New Window</a>
            <a id="sourceCodeLink" class="blueAnchorButton" href="http://bing.com" target="_blank">Source code</a>
        </div>
    </div>

    <div class="footer">
        <span><a href="http://go.microsoft.com/fwlink/?LinkId=521839&CLCID=0409">Privacy</a></span>
        <span><a href="http://go.microsoft.com/fwlink/?LinkID=246338&CLCID=0409">Legal</a></span>
        <span class="copyrights">&copy; Microsoft 2017</span>
    </div>

    <asp:Label ID="ErrorLabel" runat="server"></asp:Label>

    <script type="text/javascript" src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.2.1.min.js"></script>
    <script type="text/javascript" src="https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.js"></script>
    <script type="text/javascript" src="https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.min.js"></script>
    <script type="text/javascript" src="SiteResources/default.js"></script>
</body>
</html>

