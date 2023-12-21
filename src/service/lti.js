const axios = require("axios");
const lti = require("ltijs").Provider;
const licensesUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/licenses`;
const apiUser = process.env.C2E_SERVICES_API_USER;
const apiSecret = process.env.C2E_SERVICES_API_SECRET;
const fileUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/c2e/licensed`;
const { PlatformSetting } = require("../../models/platformSetting");

class ltiService {
  static async grade(req, res) {
    try {
      const idtoken = res.locals.token; // IdToken
      const score = req.body.grade; // User numeric score sent in the body
      // Creating Grade object
      const gradeObj = {
        userId: idtoken.user,
        scoreGiven: score,
        scoreMaximum: 100,
        activityProgress: "Completed",
        gradingProgress: "FullyGraded",
      };

      // Selecting linetItem ID
      let lineItemId = idtoken.platformContext.endpoint.lineitem; // Attempting to retrieve it from idtoken
      if (!lineItemId) {
        const response = await lti.Grade.getLineItems(idtoken, {
          resourceLinkId: true,
        });
        const lineItems = response.lineItems;
        if (lineItems.length === 0) {
          // Creating line item if there is none
          console.log("Creating new line item");
          const newLineItem = {
            scoreMaximum: 100,
            label: "Grade",
            tag: "grade",
            resourceLinkId: idtoken.platformContext.resource.id,
          };
          const lineItem = await lti.Grade.createLineItem(idtoken, newLineItem);
          lineItemId = lineItem.id;
        } else lineItemId = lineItems[0].id;
      }

      // Sending Grade
      const responseGrade = await lti.Grade.submitScore(
        idtoken,
        lineItemId,
        gradeObj
      );
      return res.send(responseGrade);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }
  }

  static async members(req, res) {
    try {
      const result = await lti.NamesAndRoles.getMembers(res.locals.token);
      if (result) return res.send(result.members);
      return res.sendStatus(500);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send(err.message);
    }
  }

  static async deeplink(req, res) {
    try {
      const resource = req.body;

      const items = {
        type: "ltiResourceLink",
        title: resource.title,
        url: `https://c2e-player-app-nodejs-stage.curriki.org/play?c2eId=${resource.id}`,
        custom: {
          name: resource.name,
          value: resource.value,
        },
      };

      const form = await lti.DeepLinking.createDeepLinkingForm(
        res.locals.token,
        items,
        { message: `Successfully Registered` }
      );
      if (form) return res.send(form);
      return res.sendStatus(500);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send(err.message);
    }
  }

  static async play(req, res) {
    try {
      const c2eId = req.query.c2eId;
      const redirectUrl = `https://lti-epub-player-dev.curriki.org/play/${c2eId}`;

      const resp = await axios.get(redirectUrl);
      return res.send(resp.data);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send(err.message);
    }
  }

  static async info(req, res) {
    const token = res.locals.token;
    const context = res.locals.context;

    return res.send({ token, context });

    const info = {};
    if (token.userInfo) {
      if (token.userInfo.name) info.name = token.userInfo.name;
      if (token.userInfo.email) info.email = token.userInfo.email;
    }

    if (context.roles) info.roles = context.roles;
    if (context.context) info.context = context.context;

    info.context.errors = { errors: {} };
    if (info.context.errors) info.context.errors = [];

    return res.send(info);
  }

  static async resources(req, res) {
    const { page = 1, limit = 10, query = "" } = req.query;

    if (
      isNaN(parseInt(page)) ||
      isNaN(parseInt(limit)) ||
      typeof query !== "string"
    ) {
      return res.status(400).send({
        status: 400,
        error: "Invalid parameter type",
        details: {
          description: "The query params provided are not formatted properly",
          message: "Invalid parameter type",
        },
      });
    }

    const platformSettings = await PlatformSetting.findOne({
      where: { lti_client_id: res.locals.token.clientId },
    });
    if (!platformSettings) {
      return res.status(400).send({
        status: 400,
        error: "No matching platform settings found",
        details: {
          description:
            "Your LTI authentication information doesn't match any existing platform settings in the C2E player",
          message: "No matching platform settings found",
        },
      });
    }

    const licensesUrl = `${platformSettings.cee_provider_url}/licenses`;
    const params = {
      page,
      limit: 9000,
      query,
      email: platformSettings.cee_licensee_id,
      secret: platformSettings.cee_secret_key,
    };

    await axios
      .get(licensesUrl, { params })
      .then(async (response) => {
        return res.send({
            "data": [
                {
                    "id": "02411320-98f6-11ee-b38d-15d491e3d304",
                    "title": "Chapter 8: Handling Exceptions",
                    "description": "Chapter 8 of \"Java All-in-One For Dummies, 7th Edition\" explains how Java deals with errors using exception objects and try/catch/finally statements, and outlines various common exceptions.",
                    "licenseemail": "katyisd@curriki.org",
                    "breadcrumb": {
                        "@id": "c2ens:c2eid-02411320-98f6-11ee-b38d-15d491e3d304/BreadcrumbList",
                        "@type": "sdons:BreadcrumbList",
                        "itemListElement": [
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02411320-98f6-11ee-b38d-15d491e3d304/ListItem/Computer-Science",
                                    "name": "Computer Science"
                                },
                                "@type": "sdons:ListItem",
                                "position": 0
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02411320-98f6-11ee-b38d-15d491e3d304/ListItem/Java®-All-in-One-For-Dummies®7th-Edition",
                                    "name": "Java® All-in-One For Dummies®7th Edition"
                                },
                                "@type": "sdons:ListItem",
                                "position": 1
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02411320-98f6-11ee-b38d-15d491e3d304/ListItem/Book-2:-Programming-Basics",
                                    "name": "Book 2: Programming Basics"
                                },
                                "@type": "sdons:ListItem",
                                "position": 2
                            }
                        ]
                    },
                    "author": {
                        "@id": "c2ens:c2eid-02411320-98f6-11ee-b38d-15d491e3d304/author/id/mike@curriki.org",
                        "url": "",
                        "name": "Mike Francis",
                        "@type": "sdons:Person",
                        "email": "mike@curriki.org"
                    },
                    "metadata": {
                        "@id": "c2ens:c2eid-02411320-98f6-11ee-b38d-15d491e3d304/metadata/general",
                        "@type": "sdons:Dataset",
                        "title": "Chapter 8: Handling Exceptions",
                        "keywords": [
                            "Education",
                            "Curriculum",
                            "Curriki",
                            "EPUB"
                        ],
                        "description": "Chapter 8 of \"Java All-in-One For Dummies, 7th Edition\" explains how Java deals with errors using exception objects and try/catch/finally statements, and outlines various common exceptions."
                    }
                },
                {
                    "id": "02413a30-98f6-11ee-b38d-15d491e3d304",
                    "title": "Chapter 1: Understanding Object-Oriented Programming",
                    "description": "Chapter 1: Understanding Object-Oriented Programming\nThis chapter introduces object-oriented programming, explains objects, classes, inheritance, interfaces, program design with objects, and UML diagramming for Java programming.",
                    "licenseemail": "katyisd@curriki.org",
                    "breadcrumb": {
                        "@id": "c2ens:c2eid-02413a30-98f6-11ee-b38d-15d491e3d304/BreadcrumbList",
                        "@type": "sdons:BreadcrumbList",
                        "itemListElement": [
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02413a30-98f6-11ee-b38d-15d491e3d304/ListItem/Computer-Science",
                                    "name": "Computer Science"
                                },
                                "@type": "sdons:ListItem",
                                "position": 0
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02413a30-98f6-11ee-b38d-15d491e3d304/ListItem/Java®-All-in-One-For-Dummies®7th-Edition",
                                    "name": "Java® All-in-One For Dummies®7th Edition"
                                },
                                "@type": "sdons:ListItem",
                                "position": 1
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02413a30-98f6-11ee-b38d-15d491e3d304/ListItem/Book-3:-Object-Oriented-Programming",
                                    "name": "Book 3: Object-Oriented Programming"
                                },
                                "@type": "sdons:ListItem",
                                "position": 2
                            }
                        ]
                    },
                    "author": {
                        "@id": "c2ens:c2eid-02413a30-98f6-11ee-b38d-15d491e3d304/author/id/mike@curriki.org",
                        "url": "",
                        "name": "Mike Francis",
                        "@type": "sdons:Person",
                        "email": "mike@curriki.org"
                    },
                    "metadata": {
                        "@id": "c2ens:c2eid-02413a30-98f6-11ee-b38d-15d491e3d304/metadata/general",
                        "@type": "sdons:Dataset",
                        "title": "Chapter 1: Understanding Object-Oriented Programming",
                        "keywords": [
                            "Education",
                            "Curriculum",
                            "Curriki",
                            "EPUB"
                        ],
                        "description": "Chapter 1: Understanding Object-Oriented Programming\nThis chapter introduces object-oriented programming, explains objects, classes, inheritance, interfaces, program design with objects, and UML diagramming for Java programming."
                    }
                },
                {
                    "id": "02418850-98f6-11ee-b38d-15d491e3d304",
                    "title": "Chapter 6: Pulling a Switcheroo",
                    "description": "Chapter 6, \"Pulling a Switcheroo,\" explains the usage of the 'switch' statement for efficient decision-making, instead of complicated 'else-if' chains, in Java programming.",
                    "licenseemail": "katyisd@curriki.org",
                    "breadcrumb": {
                        "@id": "c2ens:c2eid-02418850-98f6-11ee-b38d-15d491e3d304/BreadcrumbList",
                        "@type": "sdons:BreadcrumbList",
                        "itemListElement": [
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02418850-98f6-11ee-b38d-15d491e3d304/ListItem/Computer-Science",
                                    "name": "Computer Science"
                                },
                                "@type": "sdons:ListItem",
                                "position": 0
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02418850-98f6-11ee-b38d-15d491e3d304/ListItem/Java®-All-in-One-For-Dummies®7th-Edition",
                                    "name": "Java® All-in-One For Dummies®7th Edition"
                                },
                                "@type": "sdons:ListItem",
                                "position": 1
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02418850-98f6-11ee-b38d-15d491e3d304/ListItem/Book-2:-Programming-Basics",
                                    "name": "Book 2: Programming Basics"
                                },
                                "@type": "sdons:ListItem",
                                "position": 2
                            }
                        ]
                    },
                    "author": {
                        "@id": "c2ens:c2eid-02418850-98f6-11ee-b38d-15d491e3d304/author/id/mike@curriki.org",
                        "url": "",
                        "name": "Mike Francis",
                        "@type": "sdons:Person",
                        "email": "mike@curriki.org"
                    },
                    "metadata": {
                        "@id": "c2ens:c2eid-02418850-98f6-11ee-b38d-15d491e3d304/metadata/general",
                        "@type": "sdons:Dataset",
                        "title": "Chapter 6: Pulling a Switcheroo",
                        "keywords": [
                            "Education",
                            "Curriculum",
                            "Curriki",
                            "EPUB"
                        ],
                        "description": "Chapter 6, \"Pulling a Switcheroo,\" explains the usage of the 'switch' statement for efficient decision-making, instead of complicated 'else-if' chains, in Java programming."
                    }
                },
                {
                    "id": "0241af60-98f6-11ee-b38d-15d491e3d304",
                    "title": "Chapter 7: Adding Some Methods to Your Madness",
                    "description": "Chapter 7 discusses creating and using static methods, including methods that return values and accept parameters to improve Java program structure and reusability.",
                    "licenseemail": "katyisd@curriki.org",
                    "breadcrumb": {
                        "@id": "c2ens:c2eid-0241af60-98f6-11ee-b38d-15d491e3d304/BreadcrumbList",
                        "@type": "sdons:BreadcrumbList",
                        "itemListElement": [
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241af60-98f6-11ee-b38d-15d491e3d304/ListItem/Computer-Science",
                                    "name": "Computer Science"
                                },
                                "@type": "sdons:ListItem",
                                "position": 0
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241af60-98f6-11ee-b38d-15d491e3d304/ListItem/Java®-All-in-One-For-Dummies®7th-Edition",
                                    "name": "Java® All-in-One For Dummies®7th Edition"
                                },
                                "@type": "sdons:ListItem",
                                "position": 1
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241af60-98f6-11ee-b38d-15d491e3d304/ListItem/Book-2:-Programming-Basics",
                                    "name": "Book 2: Programming Basics"
                                },
                                "@type": "sdons:ListItem",
                                "position": 2
                            }
                        ]
                    },
                    "author": {
                        "@id": "c2ens:c2eid-0241af60-98f6-11ee-b38d-15d491e3d304/author/id/mike@curriki.org",
                        "url": "",
                        "name": "Mike Francis",
                        "@type": "sdons:Person",
                        "email": "mike@curriki.org"
                    },
                    "metadata": {
                        "@id": "c2ens:c2eid-0241af60-98f6-11ee-b38d-15d491e3d304/metadata/general",
                        "@type": "sdons:Dataset",
                        "title": "Chapter 7: Adding Some Methods to Your Madness",
                        "keywords": [
                            "Education",
                            "Curriculum",
                            "Curriki",
                            "EPUB"
                        ],
                        "description": "Chapter 7 discusses creating and using static methods, including methods that return values and accept parameters to improve Java program structure and reusability."
                    }
                },
                {
                    "id": "0241af61-98f6-11ee-b38d-15d491e3d304",
                    "title": "Chapter 2: Making Your Own Classes",
                    "description": "Chapter 2, \"Making Your Own Classes,\" covers the fundamentals of defining custom classes in Java, including declaring a class, creating constructors, adding methods, utilizing the 'this' keyword, and introducing the 'record' feature.",
                    "licenseemail": "katyisd@curriki.org",
                    "breadcrumb": {
                        "@id": "c2ens:c2eid-0241af61-98f6-11ee-b38d-15d491e3d304/BreadcrumbList",
                        "@type": "sdons:BreadcrumbList",
                        "itemListElement": [
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241af61-98f6-11ee-b38d-15d491e3d304/ListItem/Computer-Science",
                                    "name": "Computer Science"
                                },
                                "@type": "sdons:ListItem",
                                "position": 0
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241af61-98f6-11ee-b38d-15d491e3d304/ListItem/Java®-All-in-One-For-Dummies®7th-Edition",
                                    "name": "Java® All-in-One For Dummies®7th Edition"
                                },
                                "@type": "sdons:ListItem",
                                "position": 1
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241af61-98f6-11ee-b38d-15d491e3d304/ListItem/Book-3:-Object-Oriented-Programming",
                                    "name": "Book 3: Object-Oriented Programming"
                                },
                                "@type": "sdons:ListItem",
                                "position": 2
                            }
                        ]
                    },
                    "author": {
                        "@id": "c2ens:c2eid-0241af61-98f6-11ee-b38d-15d491e3d304/author/id/mike@curriki.org",
                        "url": "",
                        "name": "Mike Francis",
                        "@type": "sdons:Person",
                        "email": "mike@curriki.org"
                    },
                    "metadata": {
                        "@id": "c2ens:c2eid-0241af61-98f6-11ee-b38d-15d491e3d304/metadata/general",
                        "@type": "sdons:Dataset",
                        "title": "Chapter 2: Making Your Own Classes",
                        "keywords": [
                            "Education",
                            "Curriculum",
                            "Curriki",
                            "EPUB"
                        ],
                        "description": "Chapter 2, \"Making Your Own Classes,\" covers the fundamentals of defining custom classes in Java, including declaring a class, creating constructors, adding methods, utilizing the 'this' keyword, and introducing the 'record' feature."
                    }
                },
                {
                    "id": "0241d670-98f6-11ee-b38d-15d491e3d304",
                    "title": "Chapter 5: Going Around in Circles (or, Using Loops)",
                    "description": "Chapter 5 explains loops in Java, including while loops, their syntax, conditional expressions, and the use of braces for statement blocks within loops.",
                    "licenseemail": "katyisd@curriki.org",
                    "breadcrumb": {
                        "@id": "c2ens:c2eid-0241d670-98f6-11ee-b38d-15d491e3d304/BreadcrumbList",
                        "@type": "sdons:BreadcrumbList",
                        "itemListElement": [
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241d670-98f6-11ee-b38d-15d491e3d304/ListItem/Computer-Science",
                                    "name": "Computer Science"
                                },
                                "@type": "sdons:ListItem",
                                "position": 0
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241d670-98f6-11ee-b38d-15d491e3d304/ListItem/Java®-All-in-One-For-Dummies®7th-Edition",
                                    "name": "Java® All-in-One For Dummies®7th Edition"
                                },
                                "@type": "sdons:ListItem",
                                "position": 1
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241d670-98f6-11ee-b38d-15d491e3d304/ListItem/Book-2:-Programming-Basics",
                                    "name": "Book 2: Programming Basics"
                                },
                                "@type": "sdons:ListItem",
                                "position": 2
                            }
                        ]
                    },
                    "author": {
                        "@id": "c2ens:c2eid-0241d670-98f6-11ee-b38d-15d491e3d304/author/id/mike@curriki.org",
                        "url": "",
                        "name": "Mike Francis",
                        "@type": "sdons:Person",
                        "email": "mike@curriki.org"
                    },
                    "metadata": {
                        "@id": "c2ens:c2eid-0241d670-98f6-11ee-b38d-15d491e3d304/metadata/general",
                        "@type": "sdons:Dataset",
                        "title": "Chapter 5: Going Around in Circles (or, Using Loops)",
                        "keywords": [
                            "Education",
                            "Curriculum",
                            "Curriki",
                            "EPUB"
                        ],
                        "description": "Chapter 5 explains loops in Java, including while loops, their syntax, conditional expressions, and the use of braces for statement blocks within loops."
                    }
                },
                {
                    "id": "0241fd80-98f6-11ee-b38d-15d491e3d304",
                    "title": "Chapter 4: Making Choices",
                    "description": "Chapter 4, \"Making Choices,\" discusses how to write Java code that makes decisions using Boolean expressions, if statements, switch statements, and logical operators. It covers simple and complex conditions and comparisons.",
                    "licenseemail": "katyisd@curriki.org",
                    "breadcrumb": {
                        "@id": "c2ens:c2eid-0241fd80-98f6-11ee-b38d-15d491e3d304/BreadcrumbList",
                        "@type": "sdons:BreadcrumbList",
                        "itemListElement": [
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241fd80-98f6-11ee-b38d-15d491e3d304/ListItem/Computer-Science",
                                    "name": "Computer Science"
                                },
                                "@type": "sdons:ListItem",
                                "position": 0
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241fd80-98f6-11ee-b38d-15d491e3d304/ListItem/Java®-All-in-One-For-Dummies®7th-Edition",
                                    "name": "Java® All-in-One For Dummies®7th Edition"
                                },
                                "@type": "sdons:ListItem",
                                "position": 1
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241fd80-98f6-11ee-b38d-15d491e3d304/ListItem/Book-2:-Programming-Basics",
                                    "name": "Book 2: Programming Basics"
                                },
                                "@type": "sdons:ListItem",
                                "position": 2
                            }
                        ]
                    },
                    "author": {
                        "@id": "c2ens:c2eid-0241fd80-98f6-11ee-b38d-15d491e3d304/author/id/mike@curriki.org",
                        "url": "",
                        "name": "Mike Francis",
                        "@type": "sdons:Person",
                        "email": "mike@curriki.org"
                    },
                    "metadata": {
                        "@id": "c2ens:c2eid-0241fd80-98f6-11ee-b38d-15d491e3d304/metadata/general",
                        "@type": "sdons:Dataset",
                        "title": "Chapter 4: Making Choices",
                        "keywords": [
                            "Education",
                            "Curriculum",
                            "Curriki",
                            "EPUB"
                        ],
                        "description": "Chapter 4, \"Making Choices,\" discusses how to write Java code that makes decisions using Boolean expressions, if statements, switch statements, and logical operators. It covers simple and complex conditions and comparisons."
                    }
                },
                {
                    "id": "0241fd81-98f6-11ee-b38d-15d491e3d304",
                    "title": "Chapter 20: Knowing the Knee and the Leg",
                    "description": "Chapter 20 provides an overview of the anatomy of the knee joint and leg, including muscles, bones, ligaments, and their functions within human locomotion.",
                    "licenseemail": "katyisd@curriki.org",
                    "breadcrumb": {
                        "@id": "c2ens:c2eid-0241fd81-98f6-11ee-b38d-15d491e3d304/BreadcrumbList",
                        "@type": "sdons:BreadcrumbList",
                        "itemListElement": [
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241fd81-98f6-11ee-b38d-15d491e3d304/ListItem/Health-Science",
                                    "name": "Health Science"
                                },
                                "@type": "sdons:ListItem",
                                "position": 0
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241fd81-98f6-11ee-b38d-15d491e3d304/ListItem/Clinical-Anatomy-For-Dummies",
                                    "name": "Clinical Anatomy For Dummies"
                                },
                                "@type": "sdons:ListItem",
                                "position": 1
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-0241fd81-98f6-11ee-b38d-15d491e3d304/ListItem/\tPart-IV:-\tMoving-to-the-Upper-and-Lower-Extremities",
                                    "name": "\tPart IV: \tMoving to the Upper and Lower Extremities"
                                },
                                "@type": "sdons:ListItem",
                                "position": 2
                            }
                        ]
                    },
                    "author": {
                        "@id": "c2ens:c2eid-0241fd81-98f6-11ee-b38d-15d491e3d304/author/id/mike@curriki.org",
                        "url": "",
                        "name": "Mike Francis",
                        "@type": "sdons:Person",
                        "email": "mike@curriki.org"
                    },
                    "metadata": {
                        "@id": "c2ens:c2eid-0241fd81-98f6-11ee-b38d-15d491e3d304/metadata/general",
                        "@type": "sdons:Dataset",
                        "title": "Chapter 20: Knowing the Knee and the Leg",
                        "keywords": [
                            "Education",
                            "Curriculum",
                            "Curriki",
                            "EPUB"
                        ],
                        "description": "Chapter 20 provides an overview of the anatomy of the knee joint and leg, including muscles, bones, ligaments, and their functions within human locomotion."
                    }
                },
                {
                    "id": "02422490-98f6-11ee-b38d-15d491e3d304",
                    "title": "Chapter 21: Finding the Ankle and the Foot",
                    "description": "Chapter 21 covers the anatomical structures, muscles, bones, joints, and functions of the ankle and foot, including common injuries and clinical considerations.",
                    "licenseemail": "katyisd@curriki.org",
                    "breadcrumb": {
                        "@id": "c2ens:c2eid-02422490-98f6-11ee-b38d-15d491e3d304/BreadcrumbList",
                        "@type": "sdons:BreadcrumbList",
                        "itemListElement": [
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02422490-98f6-11ee-b38d-15d491e3d304/ListItem/Health-Science",
                                    "name": "Health Science"
                                },
                                "@type": "sdons:ListItem",
                                "position": 0
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02422490-98f6-11ee-b38d-15d491e3d304/ListItem/Clinical-Anatomy-For-Dummies",
                                    "name": "Clinical Anatomy For Dummies"
                                },
                                "@type": "sdons:ListItem",
                                "position": 1
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02422490-98f6-11ee-b38d-15d491e3d304/ListItem/\tPart-IV:-\tMoving-to-the-Upper-and-Lower-Extremities",
                                    "name": "\tPart IV: \tMoving to the Upper and Lower Extremities"
                                },
                                "@type": "sdons:ListItem",
                                "position": 2
                            }
                        ]
                    },
                    "author": {
                        "@id": "c2ens:c2eid-02422490-98f6-11ee-b38d-15d491e3d304/author/id/mike@curriki.org",
                        "url": "",
                        "name": "Mike Francis",
                        "@type": "sdons:Person",
                        "email": "mike@curriki.org"
                    },
                    "metadata": {
                        "@id": "c2ens:c2eid-02422490-98f6-11ee-b38d-15d491e3d304/metadata/general",
                        "@type": "sdons:Dataset",
                        "title": "Chapter 21: Finding the Ankle and the Foot",
                        "keywords": [
                            "Education",
                            "Curriculum",
                            "Curriki",
                            "EPUB"
                        ],
                        "description": "Chapter 21 covers the anatomical structures, muscles, bones, joints, and functions of the ankle and foot, including common injuries and clinical considerations."
                    }
                },
                {
                    "id": "02422491-98f6-11ee-b38d-15d491e3d304",
                    "title": "Chapter 4: Using Subclasses and Inheritance",
                    "description": "Chapter 4 explains Java inheritance, covering the creation of subclasses, using `protected`, implementing polymorphism, overriding methods, and creating custom exception classes. It discusses parent-child class relationships in Java.",
                    "licenseemail": "katyisd@curriki.org",
                    "breadcrumb": {
                        "@id": "c2ens:c2eid-02422491-98f6-11ee-b38d-15d491e3d304/BreadcrumbList",
                        "@type": "sdons:BreadcrumbList",
                        "itemListElement": [
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02422491-98f6-11ee-b38d-15d491e3d304/ListItem/Computer-Science",
                                    "name": "Computer Science"
                                },
                                "@type": "sdons:ListItem",
                                "position": 0
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02422491-98f6-11ee-b38d-15d491e3d304/ListItem/Java®-All-in-One-For-Dummies®7th-Edition",
                                    "name": "Java® All-in-One For Dummies®7th Edition"
                                },
                                "@type": "sdons:ListItem",
                                "position": 1
                            },
                            {
                                "item": {
                                    "@id": "c2ens:c2eid-02422491-98f6-11ee-b38d-15d491e3d304/ListItem/Book-3:-Object-Oriented-Programming",
                                    "name": "Book 3: Object-Oriented Programming"
                                },
                                "@type": "sdons:ListItem",
                                "position": 2
                            }
                        ]
                    },
                    "author": {
                        "@id": "c2ens:c2eid-02422491-98f6-11ee-b38d-15d491e3d304/author/id/mike@curriki.org",
                        "url": "",
                        "name": "Mike Francis",
                        "@type": "sdons:Person",
                        "email": "mike@curriki.org"
                    },
                    "metadata": {
                        "@id": "c2ens:c2eid-02422491-98f6-11ee-b38d-15d491e3d304/metadata/general",
                        "@type": "sdons:Dataset",
                        "title": "Chapter 4: Using Subclasses and Inheritance",
                        "keywords": [
                            "Education",
                            "Curriculum",
                            "Curriki",
                            "EPUB"
                        ],
                        "description": "Chapter 4 explains Java inheritance, covering the creation of subclasses, using `protected`, implementing polymorphism, overriding methods, and creating custom exception classes. It discusses parent-child class relationships in Java."
                    }
                }
            ],
            "count": {
                "count": 955
            },
            "page": 1,
            "limit": 10
        });
      })
      .catch((error) => {
        res.status(400).send({
          status: 400,
          error: "Failed to retrieve licenses",
          details: {
            description:
              "Failed to retrieve licenses. Please check your licensee settings",
            message: "Failed to retrieve licenses",
          },
        });
      });
  }

  static async stream(req, res) {
    var platformSettings = await PlatformSetting.findOne({
      where: { lti_client_id: res.locals.token.clientId },
    });
    if (!platformSettings) {
      return res.status(400).send({
        status: 400,
        error: "No matching platform settings found",
        details: {
          description:
            "Your LTI authentication information doesn't match any existing platform settings in the C2E player",
          message: "No matching platform settings found",
        },
      });
    }

    const { ceeId } = req.query;
    const params = {
      ceeId: ceeId,
      email: platformSettings.cee_licensee_id,
      secret: platformSettings.cee_secret_key,
      decrypt: true,
    };
    const options = {
      method: "POST",
      responseType: "stream",
    };
    const fileUrl = `${platformSettings.cee_provider_url}/c2e/licensed`;
    try {
      const response = await axios.post(fileUrl, params, options);
      const fileStream = response.data;
      const fileName = `${ceeId}.c2e`;
      const fileMime = "application/zip";
      const fileLength = response.headers["content-length"];
      const headers = {
        "Content-Type": fileMime,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileLength,
      };
      res.writeHead(200, headers);
      fileStream.pipe(res);
    } catch (e) {
      return res.status(400).send({
        status: 400,
        error: "Failed to stream file",
        details: {
          description:
            "Could not stream C2E content. Please check your licensee settings and query params",
          message: "Failed to stream file",
        },
      });
    }
  }

  static async xapi(req, res) {
    if (!req.body.id || !req.body.verb)
      return res.status(400).send("No xAPI statement provided.");

    const params = {
      statement: JSON.stringify(req.body),
      email: apiUser,
      secret: apiSecret,
    };

    await axios
      .post(xapiServiceUrl, params)
      .then(async (response) => {
        return res.send(response.data);
      })
      .catch((error) => {
        console.log(error);
        res.send({
          error: "Error: Failed to send  xAPI statement to service provider",
        });
      });
  }

  static async registerPlatform(params) {
    if (process.env.ADMIN_SECRET != params.secret) return false;

    await lti.registerPlatform({
      url: params.url,
      name: params.name,
      clientId: params.clientId,
      authenticationEndpoint: params.authenticationEndpoint,
      accesstokenEndpoint: params.accesstokenEndpoint,
      authConfig: {
        method: params.authConfigMethod,
        key: params.authConfigKey,
      },
    });
    return true;
  }
}
module.exports = { ltiService };
