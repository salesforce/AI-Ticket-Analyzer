/*
 * Copyright (c) 2026, Salesforce, Inc.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/Apache-2.0
 */

/**
 * @description Apex Controller for processing file uploads and invoking Einstein AI Prompt Templates.
 *              Designed for use with FSL Mobile App for handwritten ticket analysis.
 */
public with sharing class FileUploadAIProcessor {
    
    /**
     * @description Processes a file upload and invokes the Einstein Prompt Template for AI analysis.
     * @param recordId The Work Order (or parent record) Id to link the file to
     * @param fileName The name of the uploaded file
     * @param base64Data The Base64-encoded file content
     * @return String The response from the Einstein AI model
     * @throws AuraHandledException on any processing errors
     */
    @AuraEnabled
    public static String processFileAndPrompt(String recordId, String fileName, String base64Data) {
        Savepoint sp = Database.setSavepoint();
        
        try {
            // Validate inputs
            if (String.isBlank(recordId)) {
                throw new AuraHandledException('Record ID is required.');
            }
            if (String.isBlank(fileName)) {
                throw new AuraHandledException('File name is required.');
            }
            if (String.isBlank(base64Data)) {
                throw new AuraHandledException('File data is required.');
            }
            
            // ========================================
            // JOB 1: THE UPLOAD
            // Convert Base64 to Blob and create ContentVersion
            // Using FirstPublishLocationId to auto-link to Work Order
            // ========================================
            Blob fileBlob = EncodingUtil.base64Decode(base64Data);
            
            ContentVersion cv = new ContentVersion();
            cv.Title = fileName.substringBeforeLast('.');
            cv.PathOnClient = fileName;
            cv.VersionData = fileBlob;
            cv.Origin = 'H'; // 'H' for Chatter
            cv.FirstPublishLocationId = recordId; // Auto-creates ContentDocumentLink to Work Order
            
            insert cv;
            
            // ========================================
            // JOB 2: GET THE CONTENT DOCUMENT
            // Query to get the ContentDocumentId that was auto-created
            // ========================================
            ContentVersion insertedCV = [
                SELECT Id, ContentDocumentId, ContentDocument.Title, 
                       ContentDocument.FileType, ContentDocument.LatestPublishedVersionId
                FROM ContentVersion 
                WHERE Id = :cv.Id 
                LIMIT 1
            ];
            Id contentDocumentId = insertedCV.ContentDocumentId;
            
            // Verify the link was created - FirstPublishLocationId should auto-create it
            List<ContentDocumentLink> links = [
                SELECT Id, LinkedEntityId 
                FROM ContentDocumentLink 
                WHERE ContentDocumentId = :contentDocumentId 
                AND LinkedEntityId = :recordId
                LIMIT 1
            ];
            
            if (links.isEmpty()) {
                // Fallback: Create link manually if FirstPublishLocationId didn't work
                System.debug('FirstPublishLocationId did not create link, creating manually...');
                ContentDocumentLink cdl = new ContentDocumentLink();
                cdl.ContentDocumentId = contentDocumentId;
                cdl.LinkedEntityId = recordId;
                cdl.ShareType = 'V';
                cdl.Visibility = 'AllUsers';
                insert cdl;
                System.debug('Manual ContentDocumentLink created: ' + cdl.Id);
            } else {
                System.debug('ContentDocumentLink exists: ' + links[0].Id);
            }
            
            // ========================================
            // JOB 3: INVOKE EINSTEIN PROMPT TEMPLATE
            // Pass the ContentDocument to the AI for analysis
            // ========================================
            String aiResponse = invokeEinsteinPromptTemplate(contentDocumentId, base64Data, fileName);
            
            return aiResponse;
            
        } catch (AuraHandledException e) {
            Database.rollback(sp);
            throw e;
        } catch (Exception e) {
            Database.rollback(sp);
            System.debug(LoggingLevel.ERROR, 'FileUploadAIProcessor Error: ' + e.getMessage());
            System.debug(LoggingLevel.ERROR, 'Stack Trace: ' + e.getStackTraceString());
            throw new AuraHandledException('An error occurred while processing the file: ' + e.getMessage());
        }
    }
    
    /**
     * @description Invokes the Einstein Prompt Template to analyze the uploaded document.
     * @param contentDocumentId The ContentDocumentId of the uploaded file
     * @param base64Data The original base64 image data
     * @param fileName The file name
     * @return String The AI-generated response text
     */
    private static String invokeEinsteinPromptTemplate(Id contentDocumentId, String base64Data, String fileName) {
        // Prompt template API name from: read_handwriting.genAiPromptTemplate-meta.xml
        String promptTemplateApiName = 'read_handwriting';
        
        // Build input parameters for the prompt template
        ConnectApi.EinsteinPromptTemplateGenerationsInput input = 
            new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        
        input.isPreview = false;
        
        // Create the input mapping
        // Template definition: <apiName>HandwrittenTicket</apiName>
        //                      <referenceName>Input:HandwrittenTicket</referenceName>
        //                      <definition>SOBJECT://ContentDocument</definition>
        //                      <templateDataProviders> uses {!$Input:HandwrittenTicket.Id}
        // 
        // Based on Stack Overflow solution: The input format needs to be a Map with 'id' and 'type'
        // This allows getDataForGrounding to extract the recordId properly
        Map<String, ConnectApi.WrappedValue> inputParams = 
            new Map<String, ConnectApi.WrappedValue>();
        
        // Format: Map with 'id' and 'type' keys (not the actual sObject)
        Map<String, String> recordInput = new Map<String, String>{
            'id' => String.valueOf(contentDocumentId),
            'type' => 'ContentDocument'
        };
        
        ConnectApi.WrappedValue ticketInput = new ConnectApi.WrappedValue();
        ticketInput.value = recordInput;
        inputParams.put('Input:HandwrittenTicket', ticketInput);
        
        input.inputParams = inputParams;
        
        // Set the required application name for API identification
        input.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        input.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';
        
        // Execute the prompt template
        ConnectApi.EinsteinPromptTemplateGenerationsRepresentation response = 
            ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(promptTemplateApiName, input);
        
        // Extract the response text
        if (response != null && response.generations != null && !response.generations.isEmpty()) {
            ConnectApi.EinsteinLLMGenerationItemOutput generation = response.generations[0];
            if (generation != null && String.isNotBlank(generation.text)) {
                return generation.text;
            }
        }
        
        throw new AuraHandledException('No response received from AI model. Please try again.');
    }
}
