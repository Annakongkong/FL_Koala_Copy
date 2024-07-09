# -*- coding: utf-8 -*-
"""
Created on Thu Jul 21 14:58:09 2022

@author: MCDELZ
"""



import os, re, time
from pathlib import *
import shutil


#list 00 files
# folderpath = "\\\\cmsada2\\FocalData\\MonacoTemplates"
# files00 = [f.split('.tel')[0] for f in os.listdir(folderpath) if f.endswith('.tel')]
# files00 = [f for f in files00 if f.startswith('00')]
t1 = time.perf_counter()

current_folder_path = os.getcwd()
editfolder = f"{current_folder_path}{os.sep}input"
donefolder = f"{current_folder_path}{os.sep}output"

# rename
files = os.listdir(editfolder)

files = [f for f in files if os.path.isfile(editfolder + os.sep + f)] # remove folders  

for f in files:
    f2 = re.sub('New00', '00', f)
    
    ind = f2.find('v0')
    if ind>=0:
        vsn = str(int(f2.split('v0')[1][0])+1)
        f3 = re.sub(r'v0\d',  r'v0'+vsn, f2)
    else:
        f3 = f2  
    shutil.copy(editfolder + os.sep + f, donefolder + os.sep + f3) # write to done folder
  
 
t2 = time.perf_counter()
s = 'remove new, add 1 to v'
print(s + " (" + f"{t2-t1:0.1f}s)" )  
t1 = time.perf_counter()



   
# remove :
# source = clinicfolder   
source = donefolder   
files = os.listdir(source)  
files = [f for f in files if os.path.isfile(source + os.sep + f)] # remove folders 
files = [f for f in os.listdir(source) if f.endswith('.tel')]

colonset = []

for f in files:
    if f.endswith('.tel'):
 
        telpath = source + os.sep + f     
                    
        with open(telpath, 'r') as filepointer:   filedata = filepointer.read() #open plan file
        
        indset = [i for i in range(len(filedata)) if filedata.startswith(':',i)]
        
        colonset.append([f, indset])
        
        if len(indset)==2:
            for i in range(2):
                ind1 = indset[i] - filedata[indset[i]-3:indset[i]].find('\n')
                ind2 = indset[i] + filedata[indset[i]:indset[i]+50].find('\n')
            
                line1 = filedata[ind1:ind2]
                
                print(f"{f} \n{line1}") # show lines with :
                
            #edit & overwrite tel file    
            
            filedata2  = filedata.replace(': ', ' ') #replace :
            filedata2  = filedata.replace(':', ' ') #replace :
                
            with open(telpath, 'w') as filepointer:  filepointer.write(filedata2) #write new plan file
        
t2 = time.perf_counter()
s = 'remove : from tel'
print( s + " (" + f"{t2-t1:0.1f}s)" )  
t1 = time.perf_counter()