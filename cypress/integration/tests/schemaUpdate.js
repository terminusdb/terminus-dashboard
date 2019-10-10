module.exports={newSchema:`@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix doc: <http://195.201.12.87:6363/myFirstTerminusDB/document/> .
@prefix tcs: <http://terminusdb.com/schema/tcs#> .
@prefix xdd: <http://terminusdb.com/schema/xdd#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .

tcs:Agent
    tcs:tag tcs:abstract ;
    a owl:Class ;
    rdfs:comment "An entity with agency which can be considered to have the capacity to act as a coherent unit"@en ;
    rdfs:label "Agent"@en ;
    rdfs:subClassOf tcs:Entity .

tcs:ClassTag
    a owl:Class ;
    rdfs:comment "Tags that can be added to classes to add meta information"@en ;
    rdfs:label "Class Tags"@en ;
    owl:oneOf (tcs:abstract
    ) .

tcs:Document
    tcs:tag tcs:abstract ;
    a owl:Class ;
    rdfs:comment "A class used to designate the primary data objects managed by the system - relationships and entities"@en ;
    rdfs:label "Document Class"@en .

tcs:Entity
    tcs:tag tcs:abstract ;
    a owl:Class ;
    rdfs:comment "The class of entities (business objects / documents) managed by the system"@en ;
    rdfs:label "Entity Class"@en ;
    rdfs:subClassOf tcs:Document .

tcs:Group
    a owl:Class ;
    rdfs:comment "A grouping of humans that has some identifiable membership requirement."@en ;
    rdfs:label "Group"@en ;
    rdfs:subClassOf tcs:Agent .

tcs:Identifier
    a owl:Class ;
    rdfs:comment "A property by which an agent can be identified."@en ;
    rdfs:label "Identifier"@en .

tcs:Person
    a owl:Class ;
    rdfs:comment "A human bean ;-)"@en ;
    rdfs:label "Person"@en ;
    rdfs:subClassOf tcs:Agent .

tcs:abstract
    a tcs:ClassTag ;
    rdfs:comment "Indicates that the class is abstract - purely a logical construct, no base instantiations exist"@en ;
    rdfs:label "Abstract"@en .

tcs:date_of_birth
    a owl:DatatypeProperty ;
    rdfs:domain tcs:Person ;
    rdfs:label "Date of Birth"@en ;
    rdfs:range xsd:date .

tcs:email_address
    a owl:DatatypeProperty ;
    rdfs:domain tcs:Identifier ;
    rdfs:label "Email Adress"@en ;
    rdfs:range xdd:email .

tcs:facebook_page
    a owl:DatatypeProperty ;
    rdfs:domain tcs:Identifier ;
    rdfs:range xdd:url .

tcs:friend
    a owl:ObjectProperty ;
    rdfs:domain tcs:Person ;
    rdfs:label "Friend"@en ;
    rdfs:range tcs:Person .

tcs:identity
    a owl:ObjectProperty ;
    rdfs:domain tcs:Agent ;
    rdfs:label "Identity"@en ;
    rdfs:range tcs:Identifier .

tcs:member_of
    a owl:ObjectProperty ;
    rdfs:domain tcs:Agent ;
    rdfs:label "Member of"@en ;
    rdfs:range tcs:Group .

tcs:twitter_handle
    a owl:DatatypeProperty ;
    rdfs:domain tcs:Identifier ;
    rdfs:label "Twitter Handle"@en ;
    rdfs:range xsd:string .

tcs:website
    a owl:DatatypeProperty ;
    rdfs:domain tcs:Identifier ;
    rdfs:label "Website"@en ;
    rdfs:range xdd:url .

xdd:email
    tcs:refines xsd:string ;
    a rdfs:Datatype ;
    rdfs:comment "A valid email address"@en ;
    rdfs:label "Email"@en .

xdd:url
    tcs:refines xsd:string ;
    a rdfs:Datatype ;
    rdfs:comment "A valid http(s) URL"@en ;
    rdfs:label "URL"@en .`}