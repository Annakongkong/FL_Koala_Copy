
INSERT INTO "pyrunner"."users" ("id", "username", "password", "email", "role_id", "last_login", "created_by", "avatar", "created_at", "updated_at", "fullname") VALUES
	(18, 'test123', 'scrypt:32768:8:1$9faMsQvKU4oO7vJV$d334020427a61e3e01293d8b17e0a01ad1e4000650b519a7fc1ea3ddaa17a760dc09d82a446b8a02a27695c8bfc298781f22be6e5425102fd59d8687af676ebc', 'kk6@123.com', 0, NULL, NULL, NULL, '2024-04-26 11:53:12.21555', '2024-06-05 10:58:44.745761', 'Tommy');


INSERT INTO "pyrunner"."script" ("id", "user_id", "file_path", "status", "description", "instruction", "name", "code", "label", "created_at", "updated_at", "upload_required", "is_active", "user_full_name") VALUES
	(9, 18, 'filePath', 'active', '<p>Copy files from one location to another, extract folder values, arrange according to new hierarchy based on values (patient name and ID instead of export month)</p><p>improvement request - ask user to select source and target locations</p>', '<p>Upload Exported.zip, test editing #Test editing #Test editing 2</p>', '2ReorganiseDicomData_server1030s', '# -*- coding: utf-8 -*-
"""
Created on Tue May 18 14:16:05 2021

@author: Leah & Jess
"""

# This is test editing
# This is another editing test

# organise single folder level into ID - date_Scantype - scan name / RTPlan-Struct-Dose / other
# ignore PR, common text at start of scan name

# read main folder, for each folder get ID, name, date, scan type, scan name

# to do:
# keep 3 layers: L1 = patient, L2 = study description, L3 = series description / other
# read in export folder (month_Studies), copy to sorted folder, if patient exists, write scans & studies inside patient
# instead of index, create parameter table, write to excel

import os, time
import shutil
import pandas as pd
from datetime import datetime


t1 = time.perf_counter()


def clean_path(path):
    path = path.replace("/", os.sep).replace("\\", os.sep)
    if os.sep == "\\" and "\\\\?\\" not in path:
        # fix for Windows 260 char limit
        relative_levels = len(
            [directory for directory in path.split(os.sep) if directory == ".."]
        )
        cwd = (
            [directory for directory in os.getcwd().split(os.sep)]
            if ":" not in path
            else []
        )
        path = "\\\\?\\" + os.sep.join(
            cwd[: len(cwd) - relative_levels]
            + [directory for directory in path.split(os.sep) if directory != ""][
                relative_levels:
            ]
        )
    return path


# sourcepath = r"H:\Restrict\Radiotherapy\DicomData\exported"
# sortedpath = r"H:\Restrict\\Testsort\testsortNonUnity"

# ***change to open dialogue, defaults to this one, but possible to change
sourcepath = r"\\server1030s\DataRegistry\MIM EXPORT\EXPORT Research_MR"
sortedpath = r"\\server1030s\DataRegistry\StudyDataSorted"
redcappath = r"\\server1030s\DataRegistry\StudyDataSorted\RedCap_MRRegistry_DATA_2023-04-14_0850.csv"

# root = tk.Tk()
# root.withdraw()
# sourcepath = filedialog.askopenfilename(initialdir=sourcepath)
current_folder_path = os.getcwd()
sourcepath = f"{current_folder_path}{os.sep}input"

print("sourcepath:", sourcepath)


sortedpath = f"{current_folder_path}{os.sep}output"
IndexFile = (
    sortedpath
    + os.sep
    + "StudyDataSorted"
    + datetime.now().strftime("_%Y%m%d_%H%M")
    + ".xlsx"
)
print("IndexFile:", IndexFile)
# *** read in RedCap file, use Mosaiq to get list of UR>Subfile, get list of IDs

os.chdir(sortedpath)

print(f"started {t1}")

sites = {
    "abdo": ["abdo", "abdomen"],
    "abdo.upp": ["abdomen upper", "upper abdo", "duod", "stomach"],
    "abdo.lwr": ["abdomen lower", "lower abdo", "colon"],
    "liver": ["liver"],
    "kidney": ["kidney"],
    "pancreas": ["pancreas"],
    "brain": ["brain"],
    "breast": ["breast"],
    "chest": ["chest"],
    "hn": ["head", "neck", "HandN", "HNbilat", "HNipsi", "H&N", "H.&.N"],
    "lung": ["lung"],
    "oesophagus": ["oesoph", "esoph"],
    "pelvis": ["pelvis", "pelvis general", "bowel"],
    "rectum": ["rectum"],
    "bladder": ["bladder"],  # bladder, bowel, uterus and cervix, vagina, and rectum
    "gynae": ["gynae"],
    "prostate": ["prostate", "prost", "pros"],
    "spine": ["spine"],
    "pelvis.spine": ["pelvis&spine"],
    "bone": ["femur"],
}

techs = {
    "stereo": ["stereo", "sbrt", "srs"],
    "pall": ["pall", "palliative"],
    "FB.BH": ["free", "bh"],
}


studymonths = os.listdir(sourcepath)
print(studymonths)

for studymonth in studymonths:
    # studymonth = studymonths[0] #test

    folders = os.listdir(sourcepath + os.sep + studymonth)
    # f = folders[2] # testing

    for (
        f
    ) in (
        folders
    ):  # 0 = patname, 1 = patid, # 2 = modality, 3 = studydate, 4 = studytime 5 = studydesc, site, 6 = scanname
        # f = folders[0] #test
        HDx = {
            "patname": "",
            "patid": "",
            "modality": "",
            "studydate": "",
            "studytime": "",
            "studydesc": "",
            "series": "",
            "nslices": "",
            "x": "",
            "instance": "",
        }
        for hd in list(HDx.keys()):
            HDx[hd] = f.split("_")[list(HDx.keys()).index(hd)]

        # *** check if ID is in the RedCap list, skip if not.

        usesite = "sx"
        for sitegroup in list(sites.keys()):
            for site in sites[sitegroup]:
                if (
                    site in HDx["studydesc"].lower()
                ):  #''prostate'': [''prostate'', ''prost'', ''pros'',''Prostate''],
                    usesite = sitegroup
        HDx["site"] = usesite

        usetech = "tx"
        for techgroup in list(techs.keys()):
            for tech in techs[techgroup]:
                if tech in HDx["studydesc"].lower():
                    usetech = techgroup
        HDx["tech"] = usetech

        inst = HDx["instance"]
        try:
            HDx["instance"] = int(inst)
        except:
            HDx["instance"] = inst.lstrip("0")

        # level thing:
        L1 = HDx["patid"] + "_" + HDx["patname"]
        L2 = (
            HDx["studydate"]
            + "_"
            + HDx["modality"]
            + "_"
            + HDx["site"]
            + "_"
            + HDx["tech"]
        )
        L3 = (
            HDx["studytime"]
            + "_"
            + HDx["studydesc"]
            + "_"
            + HDx["series"]
            + "_"
            + HDx["nslices"]
            + "_"
            + str(HDx["instance"])
        )

        n = int(HDx["nslices"].split("n")[1])  # number of dicom files/slices
        #       if n<3 or len(HDx[''series''])<2 or HDx[''modality''] not in [''MR'', ''CT'', ''PR'']:  L2 = ''other_''+L2 #JL changed because RTdose and structure only 1 slice
        if HDx["modality"] not in ["MR", "CT", "RTDOSE", "RTst", "RTPLAN", "PT"]:
            L2 = "other_" + L2

        scanfolder1 = sourcepath + os.sep + studymonth + os.sep + f
        # print(''scanfolder1:'', scanfolder1)
        scanfolder2 = sortedpath + os.sep + L1 + os.sep + L2 + os.sep + L3
        # print(''scanfolder2:'', scanfolder2)
        pat = HDx["patid"] + "-" + HDx["patname"] + " " + HDx["nslices"]
        print(
            f"folder:{studymonths.index(studymonth)}/{len(studymonths)} study:{folders.index(f)}/{len(folders)} pat:{pat} sx:{usesite}, tx:{usetech}"
        )
        print(" ")

        if not os.path.exists(scanfolder2):
            shutil.copytree(clean_path(scanfolder1), clean_path(scanfolder2))
        # else: print(''skip'')


t2 = time.perf_counter()
print(f"{(t2-t1)/60:0.1f}min for sorting")

# %%

# -------------------------------------------
# create and excel file with index table
# -------------------------------------------
t3 = time.perf_counter()
HDx = [
    "PatientID",
    "Name",
    "other",
    "StudyDate",
    "Modality",
    "Site",
    "Technique",
    "StudyTime",
    "StudyDescription",
    "SeriesDescription",
    "Nslices",
    "Instance",
]

DicomList = pd.DataFrame(columns=HDx)
Flist = []

for root, rdirs, rfiles in os.walk(sortedpath):  # takes a while\

    level = root.replace(sortedpath, "").count(os.sep)

    if level == 3:
        # print(root)
        folder = root.replace(sortedpath, "").replace(os.sep, "_").split("_")
        # eg "\\server1030s\DataRegistry\StudyDataSorted\211230_RYAN^ANTHONY^FRANCIS\2021-11-18_MR_oesophagus_tx\095010_MRSim.Oesophagus_dAx.DWI.ADC_n30_0"

        folder = folder[1:]  # drop 1st empty value
        Flist.append(folder)
        ind = Flist.index(folder)
        if folder[2] != "other":
            folder.insert(2, "-")

        for i in range(len(HDx)):
            try:
                DicomList.loc[ind, HDx[i]] = folder[i]
            except:
                DicomList.loc[ind, HDx[i]] = "-"

# *** add Redcap data columns for each ID

t4 = time.perf_counter()

# %%

diff = t2 - t1
txt = "sort finished"
if diff < 60:
    diffs = f"_{diff:0.0f}s"
    print(f"{txt}, took {diff:0.1f} seconds")
elif diff < 3600:
    diffs = f"_{diff/60:0.0f}min"
    print(f"{txt}, took {diff/60:0.1f} minutes")
else:
    diffs = f"_{diff/3600:0.0f}h"
    print(f"{txt}, took {diff/3600:0.1f} hours")
IndexFile = IndexFile.replace(".xlsx", f"{diffs}.xlsx")
DicomList.to_excel(IndexFile, sheet_name="DicomList")


diff = t4 - t3
txt = "table finished"
if diff < 60:
    print(f"{txt}, took {diff:0.1f} seconds")
elif diff < 3600:
    print(f"{txt}, took {diff/60:0.1f} minutes")
else:
    print(f"{txt}, took {diff/3600:0.1f} hours")
', 'server', '2024-04-30 14:24:41.707006', '2024-06-04 05:24:44.172113', true, true, 'Alex'),
	(10, 18, 'filePath', 'active', '<p>Copy folder from one location to another, change 5 values (file name or text in a text file)</p><p>improvement request - ask user to select source and target locations</p>', '<p>Upload location1.zip; Please upload the file you want to anlysis</p>', '1CopyMonacoPatient', '# -*- coding: utf-8 -*-
"""
Created on Wed May 18 08:33:17 2022

@author: MCDELZ
"""

import os, re
import shutil
import ctypes  # An included library with Python install.
from sys import exit


current_folder_path = os.getcwd()
# this is scripted, better to ask user to select 1 or multiple target plan folders & destinations to copy & change
location1 = f"{current_folder_path}{os.sep}input"
location2 = f"{current_folder_path}{os.sep}output"

# list of plan folders to change, format: P[[old name1, new name1], [old name2, new name2]]
P = [ [''zzACDSU'',''RzzACDSUtest''] ]


# first copy folder from location 1 to location 2, then edit location 2

for pat in P:    # pat = P[0]

    IDold = pat[0]
    IDnew = pat[1]


     # 1 ---- folder name----
    path1 = location1 + os.sep + ''1~'' + IDold + os.sep
    path2 = location2 + os.sep + ''1~'' + IDnew + os.sep

    if os.path.exists(path2):
        # ctypes.windll.user32.MessageBoxW(0, "The new plan folder already exists", "Not copied", 0)
        print("The new plan folder already exists")
        exit()
    else:
        shutil.copytree(path1, path2)




    # 2 ---- demog.xxx
    path = location2 + os.sep + ''1~'' + IDnew + os.sep

    old = path + ''demographic.''+ IDold
    new = path + ''demographic.''+ IDnew
    if os.path.exists(old):
        os.rename(old, new)

        with open(new, ''r'') as filepointer:
            filedata = filepointer.read() #open plan file

        filedata2  = filedata.replace(''\n'' + IDold + ''\n'', ''\n''+IDnew+''\n'') #replace ID

        with open(new, ''w'') as filepointer:
            filepointer.write(filedata2) #write new plan file



    # 3 ---- plan / xxx.hyp----

    path = location2 + os.sep + ''1~'' + IDnew + os.sep + ''plan''

    plist = os.listdir(path)

    for planfolder in plist:
        old = path + os.sep + planfolder + os.sep + IDold + ''.hyp''

        if os.path.exists(old):
            new = path + os.sep + planfolder + os.sep + IDnew + ''.hyp''
            os.rename(old, new)


        else:
            print(f"skip {old}")

        oldb = path + os.sep + planfolder + os.sep + IDold + ''_rxB.hyp''
        if os.path.exists(oldb):
            newb = path2 + os.sep + planfolder + os.sep + IDnew + ''_rxB.hyp''
            os.rename(oldb, newb)
        # else:

            # print(f"skip {oldb}")





    # 4 ---- plan/plan.txt > xxx----

    path = location2 + os.sep+''1~'' + IDnew + os.sep + ''plan''

    plist = os.listdir(path)

    for planfolder in plist:
        planpath =   path + os.sep + planfolder + os.sep + ''plan''

        if os.path.exists(planpath):
            with open(planpath, ''r'') as filepointer: filedata_old = filepointer.read()
            if filedata_old.find(''\n''+IDold+''\n'')>0:
                filedata_new  = filedata_old.replace(''\n''+IDold+''\n'', ''\n''+IDnew+''\n'') #replace ID
                with open(planpath, ''w'') as filepointer: filepointer.write(filedata_new)

        planpathB =   path + os.sep + planfolder + os.sep + ''rxB_plan''
        if os.path.exists(planpathB):
            with open(planpathB, ''r'') as filepointer: filedata_old = filepointer.read()
            if filedata_old.find(''\n''+IDold+''\n'')>0:
                 filedata_new  = filedata_old.replace(''\n''+IDold+''\n'', ''\n''+IDnew+''\n'') # replace ID
                 with open(planpathB, ''w'') as filepointer: filepointer.write(filedata_new)







    # 5 ---- CT / info.txt > xxx----

    path = location2 + os.sep + ''1~'' + IDnew
    if os.path.exists(path):
        clist = [item for item in os.listdir(path) if re.match(r''[0-9]+~*'', item)]

        for ct in clist:
            ctpath =   path + os.sep + ct + os.sep + ''info''

            with open(ctpath, ''r'') as filepointer:
                filedata_old = filepointer.read()

            filedata_new  = filedata_old.replace(''~''+IDold+''\n'', ''~''+IDnew+''\n'') #replace ID
            filedata_new  = filedata_new.replace(''\n''+IDold+''\n'', ''\n''+IDnew+''\n'')

            with open(ctpath, ''w'') as filepointer:
                filepointer.write(filedata_new)


    print(f"The new plan folder copied & changed!\n from: \n{path1}\n\nto: \n{path2}")
    # ctypes.windll.user32.MessageBoxW(0, f"The new plan folder copied & changed!\n from: \n{path1}\n\nto: \n{path2}", "All done!", 0)


', 'Copy Patient', '2024-04-30 14:27:47.468755', '2024-05-24 06:09:15.211393', true, true, 'Sam'),
	(21, 18, 'filePath', 'active', '<p>Empty run for 30s, and this is for test only</p>', '<p>No input file required</p>', '30s running', 'import time

time.sleep(30)
print(1)', 'Long time,simple', '2024-05-09 15:47:39.488019', '2024-05-24 04:45:58.313779', false, true, 'Tom'),
	(31, 18, 'filePath', 'completed', '<p>This is second dummy test</p>', '<p>No input required</p>', 'DummyTest2', 'print("1111")', 'Dummy', '2024-05-24 06:11:30.061058', '2024-05-24 23:19:39.251724', false, true, NULL),
	(23, 18, 'filePath', 'completed', '', '', '3EditMonacoTemplates', '# -*- coding: utf-8 -*-
"""
Created on Thu Jul 21 14:58:09 2022

@author: MCDELZ
"""



import os, re, time
from pathlib import *
import shutil


#list 00 files
# folderpath = "\\\\cmsada2\\FocalData\\MonacoTemplates"
# files00 = [f.split(''.tel'')[0] for f in os.listdir(folderpath) if f.endswith(''.tel'')]
# files00 = [f for f in files00 if f.startswith(''00'')]
t1 = time.perf_counter()

current_folder_path = os.getcwd()
editfolder = f"{current_folder_path}{os.sep}input"
donefolder = f"{current_folder_path}{os.sep}output"

# rename
files = os.listdir(editfolder)

files = [f for f in files if os.path.isfile(editfolder + os.sep + f)] # remove folders

for f in files:
    f2 = re.sub(''New00'', ''00'', f)

    ind = f2.find(''v0'')
    if ind>=0:
        vsn = str(int(f2.split(''v0'')[1][0])+1)
        f3 = re.sub(r''v0\d'',  r''v0''+vsn, f2)
    else:
        f3 = f2
    shutil.copy(editfolder + os.sep + f, donefolder + os.sep + f3) # write to done folder


t2 = time.perf_counter()
s = ''remove new, add 1 to v''
print(s + " (" + f"{t2-t1:0.1f}s)" )
t1 = time.perf_counter()




# remove :
# source = clinicfolder
source = donefolder
files = os.listdir(source)
files = [f for f in files if os.path.isfile(source + os.sep + f)] # remove folders
files = [f for f in os.listdir(source) if f.endswith(''.tel'')]

colonset = []

for f in files:
    if f.endswith(''.tel''):

        telpath = source + os.sep + f

        with open(telpath, ''r'') as filepointer:   filedata = filepointer.read() #open plan file

        indset = [i for i in range(len(filedata)) if filedata.startswith('':'',i)]

        colonset.append([f, indset])

        if len(indset)==2:
            for i in range(2):
                ind1 = indset[i] - filedata[indset[i]-3:indset[i]].find(''\n'')
                ind2 = indset[i] + filedata[indset[i]:indset[i]+50].find(''\n'')

                line1 = filedata[ind1:ind2]

                print(f"{f} \n{line1}") # show lines with :

            #edit & overwrite tel file

            filedata2  = filedata.replace('': '', '' '') #replace :
            filedata2  = filedata.replace('':'', '' '') #replace :

            with open(telpath, ''w'') as filepointer:  filepointer.write(filedata2) #write new plan file

t2 = time.perf_counter()
s = ''remove : from tel''
print( s + " (" + f"{t2-t1:0.1f}s)" )
t1 = time.perf_counter()', '', '2024-05-21 12:48:32.999102', '2024-05-24 04:45:59.522825', true, true, 'Amy');




