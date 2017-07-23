﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Web.UI.WebControls;

namespace Samples
{
    public partial class Default : System.Web.UI.Page
    {

        private List<string> PageNames;
        private List<string> DuplicatePageNames;

        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                NumberOfSamples = 0;
                PageNames = new List<string>();
                DuplicatePageNames = new List<string>();

                var sampleList = new StringBuilder("[");

                var welcomeNode = new TreeNode("Welcome")
                {
                    SelectAction = TreeNodeSelectAction.Select
                };

                welcomeNode.NavigateUrl = string.Format("javascript:loadSample('{0}', '{1}', '{2}')", welcomeNode.Text, "welcome.html", null);

                sampleList.AppendFormat("{{label:'{0}',category:'',action:function(){{{1}}}}},", welcomeNode.Text, welcomeNode.NavigateUrl.Replace("javascript:", ""));

                SampleTreeView.Nodes.Add(welcomeNode);

                PageNames.Add(welcomeNode.Text);

                DirectoryInfo directory = null;
                directory = new DirectoryInfo(Server.MapPath("~"));

                foreach (var dir in directory.GetDirectories())
                {
                    //Only add folders that don't have "- Private" in the name.
                    if (!dir.Name.Contains("- Private"))
                    {
                        var categoryNode = new TreeNode(dir.Name)
                        {
                            SelectAction = TreeNodeSelectAction.Expand
                        };

                        var dirs = dir.GetDirectories();

                        if (dirs.Length > 0)
                        {
                            foreach (var d in dirs)
                            {
                                AddSampleNodes(dir, d, categoryNode, sampleList);
                            }
                        }

                        AddSampleNodes(dir, null, categoryNode, sampleList);

                        if (categoryNode.ChildNodes != null && categoryNode.ChildNodes.Count > 0)
                        {
                            SampleTreeView.Nodes.Add(categoryNode);
                        }
                    }
                }

                var externalNode = new TreeNode("External Samples")
                {
                    SelectAction = TreeNodeSelectAction.Select
                };

                externalNode.NavigateUrl = string.Format("javascript:loadSample('{0}', '{1}', '{2}')", externalNode.Text, "ExternalSamples.html", null);

                SampleTreeView.Nodes.Add(externalNode);

                PageNames.Add(externalNode.Text);
                
                if (DuplicatePageNames.Count > 0)
                {
                    var sb = new StringBuilder("Warning: Duplicate sample names found:");

                    foreach(var dn in DuplicatePageNames)
                    {
                        sb.AppendFormat("\\r\\n{0}", dn);
                    }

                    WarningMessage += sb.ToString();
                }

                sampleList.Append("]");
                SampleList = sampleList.ToString();
            }
        }

        public string WarningMessage { get; set; }

        public int NumberOfSamples { get; set; }

        public string SampleList { get; set; }

        private void AddSampleNodes(DirectoryInfo dir, DirectoryInfo dir2, TreeNode parentNode, StringBuilder sampleList)
        {
            FileInfo[] files;

            if (dir2 == null)
            {
                files = dir.GetFiles("*.html");
            }
            else
            {
                files = dir2.GetFiles("*.html");
            }

            if (files.Length > 0)
            {
                string path, sourcePath;

                foreach (FileInfo fi in files)
                {
                    if (dir2 != null)
                    {
                        path = dir.Name + "/" + dir2.Name + "/" + fi.Name.ToString();
                        sourcePath = dir.Name + "/" + dir2.Name;
                    }
                    else
                    {
                        path = dir.Name + "/" + fi.Name.ToString();
                        sourcePath = path;
                    }

                    string name = fi.Name.Replace(".html", "").Replace("'", "\\'");

                    var fileNode = new TreeNode(name)
                    {
                        SelectAction = TreeNodeSelectAction.SelectExpand,
                        NavigateUrl = string.Format("javascript:loadSample('{0}', '{1}', '{2}')", name, path, sourcePath)
                    };

                    parentNode.ChildNodes.Add(fileNode);

                    if (PageNames.Contains(name))
                    {
                        DuplicatePageNames.Add(name);
                    }
                    else
                    {
                        PageNames.Add(name);
                        sampleList.AppendFormat("{{label:'{0}',category:'{1}',action:function(){{{2}}}}},", fileNode.Text, dir.Name, fileNode.NavigateUrl.Replace("javascript:", ""));
                    }

                    NumberOfSamples++;
                }
            }
        }
    }
}