# -*- coding: utf-8 -*-
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
P = [ ['zzACDSU','RzzACDSUtest'] ]       
   
        
# first copy folder from location 1 to location 2, then edit location 2
    
for pat in P:    # pat = P[0]
    
    IDold = pat[0]
    IDnew = pat[1]
    
    
     # 1 ---- folder name----
    path1 = location1 + os.sep + '1~' + IDold + os.sep
    path2 = location2 + os.sep + '1~' + IDnew + os.sep

    if os.path.exists(path2): 
        # ctypes.windll.user32.MessageBoxW(0, "The new plan folder already exists", "Not copied", 0)
        print("The new plan folder already exists")
        exit()
    else:
        shutil.copytree(path1, path2)
    
     
        
        
    # 2 ---- demog.xxx
    path = location2 + os.sep + '1~' + IDnew + os.sep
    
    old = path + 'demographic.'+ IDold
    new = path + 'demographic.'+ IDnew
    if os.path.exists(old): 
        os.rename(old, new)
    
        with open(new, 'r') as filepointer:   
            filedata = filepointer.read() #open plan file
        
        filedata2  = filedata.replace('\n' + IDold + '\n', '\n'+IDnew+'\n') #replace ID
        
        with open(new, 'w') as filepointer: 
            filepointer.write(filedata2) #write new plan file
    
    
    
    # 3 ---- plan / xxx.hyp----
    
    path = location2 + os.sep + '1~' + IDnew + os.sep + 'plan'
    
    plist = os.listdir(path)
    
    for planfolder in plist:
        old = path + os.sep + planfolder + os.sep + IDold + '.hyp'
        
        if os.path.exists(old):
            new = path + os.sep + planfolder + os.sep + IDnew + '.hyp'
            os.rename(old, new)
            
            
        else:
            print(f"skip {old}")
            
        oldb = path + os.sep + planfolder + os.sep + IDold + '_rxB.hyp'
        if os.path.exists(oldb):
            newb = path2 + os.sep + planfolder + os.sep + IDnew + '_rxB.hyp'
            os.rename(oldb, newb)
        # else:
            
            # print(f"skip {oldb}")
    
    
    
    
    
    # 4 ---- plan/plan.txt > xxx----
    
    path = location2 + os.sep+'1~' + IDnew + os.sep + 'plan'
    
    plist = os.listdir(path)
    
    for planfolder in plist:
        planpath =   path + os.sep + planfolder + os.sep + 'plan'  
        
        if os.path.exists(planpath):
            with open(planpath, 'r') as filepointer: filedata_old = filepointer.read()
            if filedata_old.find('\n'+IDold+'\n')>0:
                filedata_new  = filedata_old.replace('\n'+IDold+'\n', '\n'+IDnew+'\n') #replace ID
                with open(planpath, 'w') as filepointer: filepointer.write(filedata_new)
         
        planpathB =   path + os.sep + planfolder + os.sep + 'rxB_plan'   
        if os.path.exists(planpathB):
            with open(planpathB, 'r') as filepointer: filedata_old = filepointer.read()
            if filedata_old.find('\n'+IDold+'\n')>0:
                 filedata_new  = filedata_old.replace('\n'+IDold+'\n', '\n'+IDnew+'\n') # replace ID
                 with open(planpathB, 'w') as filepointer: filepointer.write(filedata_new)
    
    
    
    
    
    
    
    # 5 ---- CT / info.txt > xxx----
    
    path = location2 + os.sep + '1~' + IDnew
    if os.path.exists(path):
        clist = [item for item in os.listdir(path) if re.match(r'[0-9]+~*', item)]
        
        for ct in clist:
            ctpath =   path + os.sep + ct + os.sep + 'info'   
            
            with open(ctpath, 'r') as filepointer: 
                filedata_old = filepointer.read()
            
            filedata_new  = filedata_old.replace('~'+IDold+'\n', '~'+IDnew+'\n') #replace ID
            filedata_new  = filedata_new.replace('\n'+IDold+'\n', '\n'+IDnew+'\n')
            
            with open(ctpath, 'w') as filepointer: 
                filepointer.write(filedata_new)
                

    print(f"The new plan folder copied & changed!\n from: \n{path1}\n\nto: \n{path2}")
    # ctypes.windll.user32.MessageBoxW(0, f"The new plan folder copied & changed!\n from: \n{path1}\n\nto: \n{path2}", "All done!", 0)


