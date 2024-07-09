# -*- coding: utf-8 -*-
"""
Created on Tue May 18 14:16:05 2021

@author: Leah & Jess
"""

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
                ):  #'prostate': ['prostate', 'prost', 'pros','Prostate'],
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
        #       if n<3 or len(HDx['series'])<2 or HDx['modality'] not in ['MR', 'CT', 'PR']:  L2 = 'other_'+L2 #JL changed because RTdose and structure only 1 slice
        if HDx["modality"] not in ["MR", "CT", "RTDOSE", "RTst", "RTPLAN", "PT"]:
            L2 = "other_" + L2

        scanfolder1 = sourcepath + os.sep + studymonth + os.sep + f
        # print('scanfolder1:', scanfolder1)
        scanfolder2 = sortedpath + os.sep + L1 + os.sep + L2 + os.sep + L3
        # print('scanfolder2:', scanfolder2)
        pat = HDx["patid"] + "-" + HDx["patname"] + " " + HDx["nslices"]
        print(
            f"folder:{studymonths.index(studymonth)}/{len(studymonths)} study:{folders.index(f)}/{len(folders)} pat:{pat} sx:{usesite}, tx:{usetech}"
        )
        print(" ")

        if not os.path.exists(scanfolder2):
            shutil.copytree(clean_path(scanfolder1), clean_path(scanfolder2))
        # else: print('skip')


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
